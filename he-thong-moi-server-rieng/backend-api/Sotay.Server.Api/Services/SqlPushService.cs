using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Sotay.Server.Api.Configuration;
using Sotay.Server.Api.Data;
using Sotay.Server.Api.Data.Entities;
using Sotay.Server.Api.Models.Push;
using Sotay.Server.Api.Services.Interfaces;
using WebPush;

namespace Sotay.Server.Api.Services;

public sealed class SqlPushService(
    ApplicationDbContext dbContext,
    IOptions<PushOptions> pushOptions) : IPushService
{
    public Task<PushPublicKeyDto> GetPublicKeyAsync(CancellationToken cancellationToken)
    {
        var options = pushOptions.Value;
        return Task.FromResult(new PushPublicKeyDto(
            IsPushConfigured(options),
            options.PublicKey,
            options.DefaultClickUrl));
    }

    public async Task<PushSubscriptionResult> SaveSubscriptionAsync(PushSubscriptionRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.PushSubscriptions
            .FirstOrDefaultAsync(x => x.EndpointUrl == request.Endpoint, cancellationToken);

        var isNew = entity is null;
        entity ??= new PushSubscriptionEntity
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        entity.EndpointUrl = request.Endpoint;
        entity.P256dh = request.Keys.P256dh;
        entity.AuthSecret = request.Keys.Auth;
        entity.BrowserName = request.BrowserName;
        entity.DeviceLabel = request.DeviceLabel;
        entity.UserKey = request.UserKey;
        entity.IsActive = true;
        entity.UpdatedAt = DateTime.UtcNow;

        if (isNew)
        {
            dbContext.PushSubscriptions.Add(entity);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<bool> DeleteSubscriptionAsync(string endpoint, CancellationToken cancellationToken)
    {
        var entity = await dbContext.PushSubscriptions
            .FirstOrDefaultAsync(x => x.EndpointUrl == endpoint, cancellationToken);

        if (entity is null)
        {
            return false;
        }

        dbContext.PushSubscriptions.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<PushSendResult> SendNoticeAsync(PushSendNoticeRequest request, CancellationToken cancellationToken)
    {
        var options = pushOptions.Value;
        var subscriptions = await dbContext.PushSubscriptions
            .Where(x => x.IsActive)
            .ToListAsync(cancellationToken);

        if (!IsPushConfigured(options) || subscriptions.Count == 0)
        {
            return new PushSendResult(subscriptions.Count, 0, 0);
        }

        var vapidDetails = new VapidDetails(
            options.Subject!,
            options.PublicKey!,
            options.PrivateKey!);

        var client = new WebPushClient();
        var delivered = 0;
        var removed = 0;

        foreach (var subscription in subscriptions)
        {
            try
            {
                var webPushSubscription = new PushSubscription(
                    subscription.EndpointUrl,
                    subscription.P256dh,
                    subscription.AuthSecret);

                var payload = System.Text.Json.JsonSerializer.Serialize(new
                {
                    title = request.Title,
                    body = request.Content,
                    url = string.IsNullOrWhiteSpace(request.ClickUrl)
                        ? options.DefaultClickUrl
                        : request.ClickUrl
                });

                await client.SendNotificationAsync(webPushSubscription, payload, vapidDetails);
                delivered++;
            }
            catch (WebPushException ex) when ((int?)ex.StatusCode is 404 or 410)
            {
                dbContext.PushSubscriptions.Remove(subscription);
                removed++;
            }
        }

        if (removed > 0)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return new PushSendResult(subscriptions.Count, delivered, removed);
    }

    private static bool IsPushConfigured(PushOptions options)
        => options.Enabled
            && !string.IsNullOrWhiteSpace(options.Subject)
            && !string.IsNullOrWhiteSpace(options.PublicKey)
            && !string.IsNullOrWhiteSpace(options.PrivateKey);

    private static PushSubscriptionResult Map(PushSubscriptionEntity entity)
        => new(
            entity.Id,
            entity.EndpointUrl,
            entity.BrowserName,
            entity.DeviceLabel,
            entity.UserKey,
            entity.IsActive);
}
