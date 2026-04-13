/*
    schema_v1_foundation.sql
    Muc tieu: tao bo schema khoi dau cho he thong moi chay tren SQL Server.
    Luu y:
    - Bang xac thuc admin nen duoc tao boi ASP.NET Core Identity migrations.
    - File nay tap trung vao du lieu nghiep vu va audit.
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'core')
    EXEC('CREATE SCHEMA core');
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'directory')
    EXEC('CREATE SCHEMA directory');
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'survey')
    EXEC('CREATE SCHEMA survey');
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'stats')
    EXEC('CREATE SCHEMA stats');
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'chatbot')
    EXEC('CREATE SCHEMA chatbot');
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'auth')
    EXEC('CREATE SCHEMA auth');
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'notify')
    EXEC('CREATE SCHEMA notify');
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'audit')
    EXEC('CREATE SCHEMA audit');
GO

CREATE TABLE core.ContentNodes
(
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ContentNodes PRIMARY KEY,
    ParentId UNIQUEIDENTIFIER NULL,
    Title NVARCHAR(500) NOT NULL,
    Tag NVARCHAR(250) NULL,
    SummaryHtml NVARCHAR(MAX) NULL,
    DetailHtml NVARCHAR(MAX) NULL,
    FileUrl NVARCHAR(1000) NULL,
    FileName NVARCHAR(255) NULL,
    PdfRefsJson NVARCHAR(MAX) NULL,
    ForceAccordion BIT NOT NULL CONSTRAINT DF_ContentNodes_ForceAccordion DEFAULT(0),
    Level INT NOT NULL CONSTRAINT DF_ContentNodes_Level DEFAULT(0),
    SortOrder INT NOT NULL CONSTRAINT DF_ContentNodes_SortOrder DEFAULT(0),
    IsActive BIT NOT NULL CONSTRAINT DF_ContentNodes_IsActive DEFAULT(1),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ContentNodes_CreatedAt DEFAULT(SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ContentNodes_UpdatedAt DEFAULT(SYSUTCDATETIME()),
    UpdatedBy NVARCHAR(100) NULL
);
GO

ALTER TABLE core.ContentNodes
ADD CONSTRAINT FK_ContentNodes_Parent
FOREIGN KEY (ParentId) REFERENCES core.ContentNodes(Id);
GO

CREATE INDEX IX_ContentNodes_ParentId ON core.ContentNodes(ParentId);
CREATE INDEX IX_ContentNodes_IsActive_SortOrder ON core.ContentNodes(IsActive, SortOrder);
GO

CREATE TABLE directory.Units
(
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_DirectoryUnits PRIMARY KEY,
    ParentId UNIQUEIDENTIFIER NULL,
    Name NVARCHAR(500) NOT NULL,
    UnitCode NVARCHAR(100) NULL,
    Level INT NOT NULL,
    Phone NVARCHAR(100) NULL,
    Address NVARCHAR(1000) NULL,
    Location NVARCHAR(1000) NULL,
    SortOrder INT NOT NULL CONSTRAINT DF_DirectoryUnits_SortOrder DEFAULT(0),
    IsActive BIT NOT NULL CONSTRAINT DF_DirectoryUnits_IsActive DEFAULT(1),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DirectoryUnits_CreatedAt DEFAULT(SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DirectoryUnits_UpdatedAt DEFAULT(SYSUTCDATETIME()),
    UpdatedBy NVARCHAR(100) NULL
);
GO

ALTER TABLE directory.Units
ADD CONSTRAINT FK_DirectoryUnits_Parent
FOREIGN KEY (ParentId) REFERENCES directory.Units(Id);
GO

CREATE INDEX IX_DirectoryUnits_ParentId ON directory.Units(ParentId);
CREATE INDEX IX_DirectoryUnits_Level_IsActive_SortOrder ON directory.Units(Level, IsActive, SortOrder);
GO

CREATE TABLE survey.Responses
(
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_SurveyResponses PRIMARY KEY,
    ResponseType NVARCHAR(50) NOT NULL,
    RatingLabel NVARCHAR(100) NULL,
    Content NVARCHAR(MAX) NULL,
    SourcePage NVARCHAR(255) NULL,
    ClientIpHash NVARCHAR(255) NULL,
    UserAgent NVARCHAR(1000) NULL,
    SubmittedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SurveyResponses_SubmittedAt DEFAULT(SYSUTCDATETIME())
);
GO

CREATE INDEX IX_SurveyResponses_ResponseType_SubmittedAt ON survey.Responses(ResponseType, SubmittedAt DESC);
GO

CREATE TABLE stats.UsageEvents
(
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_UsageEvents PRIMARY KEY,
    ActionType NVARCHAR(50) NOT NULL,
    Detail NVARCHAR(2000) NULL,
    SessionKey NVARCHAR(200) NULL,
    SourcePage NVARCHAR(255) NULL,
    ClientIpHash NVARCHAR(255) NULL,
    UserAgent NVARCHAR(1000) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_UsageEvents_CreatedAt DEFAULT(SYSUTCDATETIME())
);
GO

CREATE INDEX IX_UsageEvents_ActionType_CreatedAt ON stats.UsageEvents(ActionType, CreatedAt DESC);
CREATE INDEX IX_UsageEvents_CreatedAt ON stats.UsageEvents(CreatedAt DESC);
GO

CREATE TABLE notify.Notices
(
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_NotifyNotices PRIMARY KEY,
    Title NVARCHAR(300) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    IsPublic BIT NOT NULL CONSTRAINT DF_NotifyNotices_IsPublic DEFAULT(0),
    PublishedAt DATETIME2(0) NOT NULL CONSTRAINT DF_NotifyNotices_PublishedAt DEFAULT(SYSUTCDATETIME()),
    IsActive BIT NOT NULL CONSTRAINT DF_NotifyNotices_IsActive DEFAULT(1),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_NotifyNotices_CreatedAt DEFAULT(SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_NotifyNotices_UpdatedAt DEFAULT(SYSUTCDATETIME()),
    UpdatedBy NVARCHAR(100) NULL
);
GO

CREATE INDEX IX_NotifyNotices_PublishedAt ON notify.Notices(PublishedAt DESC);
CREATE INDEX IX_NotifyNotices_IsActive_PublishedAt ON notify.Notices(IsActive, PublishedAt DESC);
GO

CREATE TABLE chatbot.Conversations
(
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ChatbotConversations PRIMARY KEY,
    Channel NVARCHAR(50) NOT NULL CONSTRAINT DF_ChatbotConversations_Channel DEFAULT('web'),
    SessionKey NVARCHAR(200) NULL,
    StartedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ChatbotConversations_StartedAt DEFAULT(SYSUTCDATETIME()),
    LastMessageAt DATETIME2(0) NOT NULL CONSTRAINT DF_ChatbotConversations_LastMessageAt DEFAULT(SYSUTCDATETIME())
);
GO

CREATE TABLE chatbot.Messages
(
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ChatbotMessages PRIMARY KEY,
    ConversationId UNIQUEIDENTIFIER NOT NULL,
    RoleName NVARCHAR(20) NOT NULL,
    MessageText NVARCHAR(MAX) NOT NULL,
    ProviderName NVARCHAR(100) NULL,
    ModelName NVARCHAR(100) NULL,
    PromptTokens INT NULL,
    CompletionTokens INT NULL,
    IsError BIT NOT NULL CONSTRAINT DF_ChatbotMessages_IsError DEFAULT(0),
    ErrorCode NVARCHAR(100) NULL,
    ErrorMessage NVARCHAR(2000) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ChatbotMessages_CreatedAt DEFAULT(SYSUTCDATETIME())
);
GO

ALTER TABLE chatbot.Messages
ADD CONSTRAINT FK_ChatbotMessages_Conversation
FOREIGN KEY (ConversationId) REFERENCES chatbot.Conversations(Id);
GO

CREATE INDEX IX_ChatbotMessages_ConversationId_CreatedAt ON chatbot.Messages(ConversationId, CreatedAt);
GO

CREATE TABLE notify.Subscriptions
(
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_NotifySubscriptions PRIMARY KEY,
    EndpointUrl NVARCHAR(2000) NOT NULL,
    P256dh NVARCHAR(1000) NOT NULL,
    AuthSecret NVARCHAR(1000) NOT NULL,
    BrowserName NVARCHAR(100) NULL,
    DeviceLabel NVARCHAR(255) NULL,
    UserKey NVARCHAR(100) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_NotifySubscriptions_IsActive DEFAULT(1),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_NotifySubscriptions_CreatedAt DEFAULT(SYSUTCDATETIME()),
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_NotifySubscriptions_UpdatedAt DEFAULT(SYSUTCDATETIME())
);
GO

CREATE UNIQUE INDEX UX_NotifySubscriptions_EndpointUrl ON notify.Subscriptions(EndpointUrl);
GO

CREATE TABLE core.SystemSettings
(
    SettingKey NVARCHAR(150) NOT NULL CONSTRAINT PK_SystemSettings PRIMARY KEY,
    SettingValue NVARCHAR(MAX) NULL,
    ValueType NVARCHAR(50) NOT NULL CONSTRAINT DF_SystemSettings_ValueType DEFAULT('string'),
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SystemSettings_UpdatedAt DEFAULT(SYSUTCDATETIME()),
    UpdatedBy NVARCHAR(100) NULL
);
GO

CREATE TABLE audit.AdminAuditLogs
(
    Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AdminAuditLogs PRIMARY KEY,
    AdminUserId NVARCHAR(100) NULL,
    AdminUserName NVARCHAR(255) NULL,
    ActionName NVARCHAR(255) NOT NULL,
    EntityName NVARCHAR(100) NOT NULL,
    EntityId NVARCHAR(100) NULL,
    DetailsJson NVARCHAR(MAX) NULL,
    ClientIp NVARCHAR(100) NULL,
    UserAgent NVARCHAR(1000) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AdminAuditLogs_CreatedAt DEFAULT(SYSUTCDATETIME())
);
GO

CREATE INDEX IX_AdminAuditLogs_EntityName_EntityId ON audit.AdminAuditLogs(EntityName, EntityId);
CREATE INDEX IX_AdminAuditLogs_CreatedAt ON audit.AdminAuditLogs(CreatedAt DESC);
GO
