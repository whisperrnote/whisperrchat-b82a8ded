#!/usr/bin/env python3
"""
WhisperChat/TenChat - Comprehensive Database Schema Generator
Designed to scale to Telegram/WhatsApp levels with Web3 integration
"""

import json
from typing import List, Dict, Any

def create_attribute(key: str, attr_type: str, required: bool = False, 
                     array: bool = False, size: int = 255, **kwargs) -> Dict[str, Any]:
    """Create an attribute definition"""
    attr = {
        "key": key,
        "type": attr_type,
        "required": required,
        "array": array
    }
    
    if attr_type == "string":
        attr["size"] = size
        attr["default"] = kwargs.get("default", None)
        attr["encrypt"] = kwargs.get("encrypt", False)
        if "elements" in kwargs:
            attr["format"] = "enum"
            attr["elements"] = kwargs["elements"]
    elif attr_type == "integer":
        attr["min"] = kwargs.get("min", -9223372036854775808)
        attr["max"] = kwargs.get("max", 9223372036854775807)
        attr["default"] = kwargs.get("default", None)
    elif attr_type == "boolean":
        attr["default"] = kwargs.get("default", False)
    elif attr_type == "datetime":
        attr["format"] = ""
        attr["default"] = kwargs.get("default", None)
    elif attr_type == "double":
        attr["min"] = kwargs.get("min", -1.7976931348623157e+308)
        attr["max"] = kwargs.get("max", 1.7976931348623157e+308)
        attr["default"] = kwargs.get("default", None)
    elif attr_type == "url":
        attr["format"] = "url"
        attr["default"] = kwargs.get("default", None)
    elif attr_type == "email":
        attr["format"] = "email"
        attr["default"] = kwargs.get("default", None)
    elif attr_type == "ip":
        attr["format"] = "ip"
        attr["default"] = kwargs.get("default", None)
    
    return attr

def create_index(key: str, idx_type: str, attributes: List[str], 
                 orders: List[str] = None) -> Dict[str, Any]:
    """Create an index definition"""
    if orders is None:
        orders = ["ASC"] * len(attributes)
    
    return {
        "key": key,
        "type": idx_type,
        "status": "available",
        "attributes": attributes,
        "orders": orders
    }

def create_collection(coll_id: str, name: str, database_id: str, 
                     attributes: List[Dict], indexes: List[Dict] = None,
                     doc_security: bool = False) -> Dict[str, Any]:
    """Create a collection definition"""
    return {
        "$id": coll_id,
        "$permissions": [
            "create(\"users\")",
            "read(\"users\")",
            "update(\"users\")",
            "delete(\"users\")",
            "read(\"any\")"
        ],
        "databaseId": database_id,
        "name": name,
        "enabled": true,
        "documentSecurity": doc_security,
        "attributes": attributes,
        "indexes": indexes or []
    }

# MAIN DATABASE COLLECTIONS
def get_profiles_collection():
    """User Profiles - Core identity management"""
    return create_collection(
        "profiles",
        "Profiles",
        "mainDB",
        [
            create_attribute("userId", "string", True, size=256),
            create_attribute("username", "string", False, size=50),
            create_attribute("displayName", "string", False, size=100),
            create_attribute("bio", "string", False, size=500),
            create_attribute("email", "email", False),
            create_attribute("phone", "string", False, size=20),
            create_attribute("avatarUrl", "url", False),
            create_attribute("avatarFileId", "string", False, size=256),
            create_attribute("coverImageUrl", "url", False),
            create_attribute("coverImageFileId", "string", False, size=256),
            create_attribute("tagline", "string", False, size=150),
            create_attribute("location", "string", False, size=100),
            create_attribute("timezone", "string", False, size=50),
            create_attribute("website", "url", False),
            create_attribute("socialLinks", "string", False, size=2000),  # JSON
            create_attribute("preferences", "string", False, size=5000),  # JSON
            create_attribute("privacySettings", "string", False, size=5000),  # JSON
            create_attribute("status", "string", False, elements=["active", "away", "busy", "offline", "invisible"], default="active"),
            create_attribute("statusMessage", "string", False, size=150),
            create_attribute("lastSeen", "datetime", False),
            create_attribute("isOnline", "boolean", False, default=False),
            create_attribute("isVerified", "boolean", False, default=False),
            create_attribute("isPremium", "boolean", False, default=False),
            create_attribute("premiumExpiry", "datetime", False),
            create_attribute("reputationScore", "integer", False, default=0),
            create_attribute("level", "integer", False, default=1),
            create_attribute("xp", "integer", False, default=0),
            create_attribute("streakDays", "integer", False, default=0),
            create_attribute("badges", "string", True, size=50),  # Array of badge IDs
            create_attribute("interests", "string", True, size=50),
            create_attribute("languages", "string", True, size=20),
            create_attribute("theme", "string", False, elements=["light", "dark", "auto", "amoled"], default="auto"),
            create_attribute("createdAt", "datetime", False),
            create_attribute("updatedAt", "datetime", False),
        ],
        [
            create_index("idx_username", "unique", ["username"]),
            create_index("idx_userId", "unique", ["userId"]),
            create_index("idx_isOnline", "key", ["isOnline"]),
            create_index("idx_lastSeen", "key", ["lastSeen"]),
        ],
        doc_security=True
    )

def get_conversations_collection():
    """Conversations - Chat rooms (1-on-1, groups, channels)"""
    return create_collection(
        "conversations",
        "Conversations",
        "mainDB",
        [
            create_attribute("type", "string", True, elements=["direct", "group", "channel", "broadcast"]),
            create_attribute("name", "string", False, size=100),
            create_attribute("description", "string", False, size=500),
            create_attribute("avatarUrl", "url", False),
            create_attribute("avatarFileId", "string", False, size=256),
            create_attribute("creatorId", "string", True, size=256),
            create_attribute("participantIds", "string", True, size=10000),  # Array
            create_attribute("adminIds", "string", True, size=256),  # Array
            create_attribute("moderatorIds", "string", True, size=256),  # Array
            create_attribute("participantCount", "integer", False, default=0),
            create_attribute("maxParticipants", "integer", False, default=200000),  # Telegram style
            create_attribute("isEncrypted", "boolean", False, default=True),
            create_attribute("encryptionVersion", "string", False, size=20),
            create_attribute("isPinned", "string", True, size=256),  # Array of userIds who pinned
            create_attribute("isMuted", "string", True, size=256),  # Array of userIds who muted
            create_attribute("isArchived", "string", True, size=256),  # Array of userIds who archived
            create_attribute("lastMessageId", "string", False, size=256),
            create_attribute("lastMessageText", "string", False, size=300),
            create_attribute("lastMessageAt", "datetime", False),
            create_attribute("lastMessageSenderId", "string", False, size=256),
            create_attribute("unreadCount", "string", False, size=10000),  # JSON: {userId: count}
            create_attribute("settings", "string", False, size=5000),  # JSON
            create_attribute("isPublic", "boolean", False, default=False),
            create_attribute("inviteLink", "string", False, size=256),
            create_attribute("inviteLinkExpiry", "datetime", False),
            create_attribute("category", "string", False, size=50),
            create_attribute("tags", "string", True, size=50),
            create_attribute("createdAt", "datetime", False),
            create_attribute("updatedAt", "datetime", False),
        ],
        [
            create_index("idx_lastMessageAt", "key", ["lastMessageAt"], ["DESC"]),
            create_index("idx_type", "key", ["type"]),
            create_index("idx_creatorId", "key", ["creatorId"]),
        ]
    )

def get_messages_collection():
    """Messages - All chat messages"""
    return create_collection(
        "messages",
        "Messages",
        "mainDB",
        [
            create_attribute("conversationId", "string", True, size=256),
            create_attribute("senderId", "string", True, size=256),
            create_attribute("content", "string", True, size=10000),  # Encrypted content
            create_attribute("contentType", "string", True, elements=[
                "text", "image", "video", "audio", "file", "gif", "sticker",
                "location", "contact", "poll", "voice", "crypto_tx", "nft",
                "token_gift", "link", "reply", "forward", "story_reply"
            ]),
            create_attribute("plainText", "string", False, size=300),  # For search/preview
            create_attribute("mediaUrls", "string", True, size=1000),  # Array
            create_attribute("mediaFileIds", "string", True, size=256),  # Array
            create_attribute("thumbnailUrl", "url", False),
            create_attribute("thumbnailFileId", "string", False, size=256),
            create_attribute("metadata", "string", False, size=10000),  # JSON
            create_attribute("replyToMessageId", "string", False, size=256),
            create_attribute("forwardedFromMessageId", "string", False, size=256),
            create_attribute("forwardedFromConversationId", "string", False, size=256),
            create_attribute("editedAt", "datetime", False),
            create_attribute("deletedAt", "datetime", False),
            create_attribute("deletedFor", "string", True, size=256),  # Array of userIds
            create_attribute("isSystemMessage", "boolean", False, default=False),
            create_attribute("isPinned", "boolean", False, default=False),
            create_attribute("pinnedAt", "datetime", False),
            create_attribute("reactions", "string", False, size=10000),  # JSON: {emoji: [userIds]}
            create_attribute("mentions", "string", True, size=256),  # Array of userIds
            create_attribute("links", "string", True, size=1000),  # Array of URLs
            create_attribute("readBy", "string", True, size=10000),  # Array
            create_attribute("deliveredTo", "string", True, size=10000),  # Array
            create_attribute("status", "string", False, elements=["sending", "sent", "delivered", "read", "failed"], default="sending"),
            create_attribute("expiresAt", "datetime", False),  # Self-destruct messages
            create_attribute("createdAt", "datetime", False),
            create_attribute("updatedAt", "datetime", False),
        ],
        [
            create_index("idx_conversation_time", "key", ["conversationId", "createdAt"], ["ASC", "DESC"]),
            create_index("idx_sender", "key", ["senderId"]),
            create_index("idx_contentType", "key", ["contentType"]),
        ]
    )

def get_message_queue_collection():
    """Message Queue - For reliable message delivery"""
    return create_collection(
        "messageQueue",
        "MessageQueue",
        "mainDB",
        [
            create_attribute("messageId", "string", True, size=256),
            create_attribute("conversationId", "string", True, size=256),
            create_attribute("recipientIds", "string", True, size=10000),  # Array
            create_attribute("pendingFor", "string", True, size=10000),  # Array
            create_attribute("priority", "integer", False, default=0),
            create_attribute("retryCount", "integer", False, default=0),
            create_attribute("maxRetries", "integer", False, default=3),
            create_attribute("status", "string", False, elements=["pending", "processing", "delivered", "failed"], default="pending"),
            create_attribute("error", "string", False, size=1000),
            create_attribute("scheduledFor", "datetime", False),
            create_attribute("createdAt", "datetime", False),
            create_attribute("processedAt", "datetime", False),
        ],
        [
            create_index("idx_status_priority", "key", ["status", "priority"], ["ASC", "DESC"]),
            create_index("idx_scheduled", "key", ["scheduledFor"]),
        ]
    )

def get_contacts_collection():
    """Contacts - User connections"""
    return create_collection(
        "contacts",
        "Contacts",
        "mainDB",
        [
            create_attribute("userId", "string", True, size=256),
            create_attribute("contactUserId", "string", True, size=256),
            create_attribute("nickname", "string", False, size=100),
            create_attribute("relationship", "string", False, elements=["friend", "family", "colleague", "acquaintance", "blocked", "favorite"], default="friend"),
            create_attribute("isBlocked", "boolean", False, default=False),
            create_attribute("isFavorite", "boolean", False, default=False),
            create_attribute("notes", "string", False, size=500),
            create_attribute("tags", "string", True, size=50),
            create_attribute("lastInteraction", "datetime", False),
            create_attribute("addedAt", "datetime", False),
            create_attribute("updatedAt", "datetime", False),
        ],
        [
            create_index("idx_user_contact", "unique", ["userId", "contactUserId"]),
            create_index("idx_relationship", "key", ["userId", "relationship"]),
        ]
    )

def get_typing_indicators_collection():
    """Typing Indicators - Real-time typing status"""
    return create_collection(
        "typingIndicators",
        "TypingIndicators",
        "mainDB",
        [
            create_attribute("conversationId", "string", True, size=256),
            create_attribute("userId", "string", True, size=256),
            create_attribute("isTyping", "boolean", True, default=True),
            create_attribute("expiresAt", "datetime", True),  # Auto-cleanup after 10 seconds
        ],
        [
            create_index("idx_conversation_typing", "key", ["conversationId", "isTyping"]),
            create_index("idx_expires", "key", ["expiresAt"]),
        ]
    )

# Continue with part 2...
print("Schema generation part 1 complete")
