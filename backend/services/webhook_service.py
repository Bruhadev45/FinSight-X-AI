"""
Webhook Service - Triggers webhook events
"""
import hmac
import hashlib
import json
import logging
from typing import Dict, Any, List
from datetime import datetime
import httpx
from sqlalchemy.orm import Session

from models.webhook import Webhook

logger = logging.getLogger(__name__)


class WebhookService:
    """Service for triggering and managing webhooks"""

    @staticmethod
    async def trigger_webhooks(
        db: Session,
        organization_id: int,
        event_type: str,
        payload: Dict[str, Any]
    ):
        """
        Trigger webhooks for a specific event

        Args:
            db: Database session
            organization_id: Organization ID
            event_type: Event type (e.g., "ai.analysis.completed")
            payload: Event payload data
        """
        # Get all active webhooks for this organization and event type
        webhooks = db.query(Webhook).filter(
            Webhook.organization_id == organization_id,
            Webhook.enabled == True
        ).all()

        triggered_webhooks = []

        for webhook in webhooks:
            events = json.loads(webhook.events)
            if event_type in events:
                success = await WebhookService._send_webhook(webhook, event_type, payload)
                if success:
                    webhook.last_triggered_at = datetime.utcnow()
                    triggered_webhooks.append(webhook.id)

        db.commit()

        logger.info(
            f"Triggered {len(triggered_webhooks)} webhooks for event: {event_type}"
        )

        return triggered_webhooks

    @staticmethod
    async def _send_webhook(
        webhook: Webhook,
        event_type: str,
        payload: Dict[str, Any]
    ) -> bool:
        """
        Send webhook HTTP request

        Args:
            webhook: Webhook model instance
            event_type: Event type
            payload: Event payload

        Returns:
            True if successful, False otherwise
        """
        try:
            # Prepare webhook payload
            webhook_payload = {
                "event": event_type,
                "timestamp": datetime.utcnow().isoformat(),
                "organizationId": webhook.organization_id,
                "data": payload
            }

            # Generate HMAC signature
            signature = WebhookService._generate_signature(
                webhook.secret,
                json.dumps(webhook_payload)
            )

            # Send webhook request
            headers = {
                "Content-Type": "application/json",
                "X-Webhook-Signature": signature,
                "X-Webhook-Event": event_type
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    webhook.url,
                    json=webhook_payload,
                    headers=headers,
                    timeout=30.0
                )

                if response.status_code == 200:
                    logger.info(f"Webhook sent successfully to {webhook.url}")
                    return True
                else:
                    logger.warning(
                        f"Webhook failed with status {response.status_code}: {webhook.url}"
                    )
                    return False

        except Exception as e:
            logger.error(f"Failed to send webhook to {webhook.url}: {str(e)}")
            return False

    @staticmethod
    def _generate_signature(secret: str, payload: str) -> str:
        """
        Generate HMAC-SHA256 signature for webhook

        Args:
            secret: Webhook secret
            payload: Payload string

        Returns:
            HMAC signature
        """
        signature = hmac.new(
            secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()

        return f"sha256={signature}"

    @staticmethod
    def verify_signature(secret: str, payload: str, signature: str) -> bool:
        """
        Verify webhook signature

        Args:
            secret: Webhook secret
            payload: Payload string
            signature: Provided signature

        Returns:
            True if signature is valid
        """
        expected_signature = WebhookService._generate_signature(secret, payload)
        return hmac.compare_digest(expected_signature, signature)
