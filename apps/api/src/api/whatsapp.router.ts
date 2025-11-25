import type { Request, Response, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { whatsappService } from '../services/whatsapp.service';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: ExpressRouter = Router();

/**
 * GET /api/whatsapp/status
 * Get WhatsApp client status
 */
router.get('/status', authMiddleware, (_req: Request, res: Response): void => {
  const status = whatsappService.getStatus();
  res.json({
    success: true,
    data: status,
  });
});

/**
 * GET /api/whatsapp/qr
 * Get QR code for scanning
 */
router.get('/qr', authMiddleware, (_req: Request, res: Response): void => {
  const status = whatsappService.getStatus();

  if (status.isReady) {
    res.json({
      success: true,
      message: 'WhatsApp is already connected',
      data: { isReady: true },
    });
    return;
  }

  if (!status.hasQR) {
    res.json({
      success: false,
      message: 'QR code not yet generated. Please wait...',
      data: { hasQR: false },
    });
    return;
  }

  res.json({
    success: true,
    message: 'QR code available',
    data: {
      qrCode: status.qrCode,
      hasQR: true,
    },
  });
});

/**
 * POST /api/whatsapp/send
 * Send a message
 * Body: { to: "628xxx", message: "Hello" }
 */
router.post(
  '/send',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { to, message } = req.body as { to?: string; message?: string };

    if (to == null || message == null || to === '' || message === '') {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: to, message',
      });
      return;
    }

    try {
      await whatsappService.sendMessage(to, message);
      res.json({
        success: true,
        message: 'Message sent successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  }),
);

/**
 * POST /api/whatsapp/send-media
 * Send a message with media
 * Body: { to: "628xxx", message: "Caption", mediaPath: "/path/to/file" }
 */
router.post(
  '/send-media',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { to, message, mediaPath, caption } = req.body as {
      to?: string;
      message?: string;
      mediaPath?: string;
      caption?: string;
    };

    if (to == null || mediaPath == null || to === '' || mediaPath === '') {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: to, mediaPath',
      });
      return;
    }

    try {
      await whatsappService.sendMessageWithMedia(
        to,
        message ?? '',
        mediaPath,
        caption,
      );
      res.json({
        success: true,
        message: 'Message with media sent successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  }),
);

/**
 * POST /api/whatsapp/broadcast
 * Broadcast message to multiple recipients
 * Body: { recipients: ["628xxx", "628yyy"], message: "Hello" }
 */
router.post(
  '/broadcast',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { recipients, message } = req.body as {
      recipients?: string[];
      message?: string;
    };

    if (
      recipients == null ||
      !Array.isArray(recipients) ||
      message == null ||
      message === ''
    ) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: recipients (array), message',
      });
      return;
    }

    try {
      await whatsappService.broadcastMessage(recipients, message);
      res.json({
        success: true,
        message: `Broadcast sent to ${recipients.length} recipients`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to broadcast message',
      });
    }
  }),
);

/**
 * POST /api/whatsapp/check
 * Check if number is registered on WhatsApp
 * Body: { phone: "628xxx" }
 */
router.post(
  '/check',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { phone } = req.body as { phone?: string };

    if (phone == null || phone === '') {
      res.status(400).json({
        success: false,
        message: 'Missing required field: phone',
      });
      return;
    }

    try {
      const isRegistered = await whatsappService.isRegistered(phone);
      res.json({
        success: true,
        data: {
          phone,
          isRegistered,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to check number',
      });
    }
  }),
);

/**
 * POST /api/whatsapp/logout
 * Logout and destroy session
 */
router.post(
  '/logout',
  authMiddleware,
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    try {
      await whatsappService.logout();
      res.json({
        success: true,
        message: 'WhatsApp logged out successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to logout',
      });
    }
  }),
);

export default router;
