using Microsoft.AspNetCore.Mvc;
using Sotay.Server.Api.Models.Chatbot;
using Sotay.Server.Api.Models.Common;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Controllers;

[ApiController]
[Route("api/chatbot")]
public sealed class ChatbotController(IChatbotService chatbotService) : ControllerBase
{
    [HttpPost("ask")]
    public async Task<ActionResult<ApiEnvelope<ChatReplyDto>>> Ask(
        [FromBody] ChatRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new ApiEnvelope<ChatReplyDto>(false, null, "Thiếu nội dung câu hỏi."));
        }

        try
        {
            var result = await chatbotService.AskAsync(request, cancellationToken);
            return Ok(new ApiEnvelope<ChatReplyDto>(true, result));
        }
        catch
        {
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                new ApiEnvelope<ChatReplyDto>(
                    false,
                    null,
                    "Dịch vụ chatbot đang tạm thời bận hoặc chưa sẵn sàng. Vui lòng thử lại sau."));
        }
    }
}
