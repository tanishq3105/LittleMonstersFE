import nodemailer from 'nodemailer';

// ============================================
// EMAIL TOGGLE - Set to 'false' in .env to disable all emails
// ============================================
const EMAIL_ENABLED = process.env.EMAIL_ENABLED !== 'false';

// Create email transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const STORE_NAME = 'Little Monsters';
const SUPPORT_EMAIL = process.env.EMAIL_USER || 'support@littlemonsters.com';

// Helper to check if emails are enabled
const isEmailEnabled = () => {
    if (!EMAIL_ENABLED) {
        console.log('[EMAIL] Emails are disabled (EMAIL_ENABLED=false)');
        return false;
    }
    return true;
};

// Email templates
const getBaseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${STORE_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🎒 ${STORE_NAME}</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Fun Travel Kits for Kids</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #14b8a6;">${SUPPORT_EMAIL}</a>
              </p>
              <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 11px;">
                © ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

interface OrderItem {
    name: string;
    price: number;
    quantity: number;
}

interface OrderEmailData {
    orderId: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: 'ONLINE' | 'COD';
}

// Format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
};

// Generate items table HTML
const generateItemsTable = (items: OrderItem[]) => {
    const rows = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.price)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join('');

    return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin: 20px 0;">
      <tr style="background-color: #f8fafc;">
        <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Item</th>
        <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Qty</th>
        <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Price</th>
        <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Subtotal</th>
      </tr>
      ${rows}
    </table>
  `;
};

// Send order confirmation email
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
    if (!isEmailEnabled()) return false;

    const { orderId, name, email, phone, address, items, totalAmount, paymentMethod } = data;

    const content = `
    <h2 style="color: #14b8a6; margin: 0 0 20px 0;">Order Confirmed! 🎉</h2>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Hello <strong>${name}</strong>,
    </p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Thank you for your order! We're excited to prepare your fun travel kits for your little adventurer.
    </p>
    
    <!-- Order Info -->
    <div style="background-color: #f0fdfa; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; color: #0d9488; font-weight: 600;">Order ID: <span style="color: #374151;">#${orderId.slice(0, 8).toUpperCase()}</span></p>
      <p style="margin: 10px 0 0 0; color: #0d9488; font-weight: 600;">Payment Method: 
        <span style="color: #374151;">${paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 Online Payment'}</span>
      </p>
    </div>
    
    <!-- Items Table -->
    <h3 style="color: #374151; margin: 30px 0 10px 0;">Order Items:</h3>
    ${generateItemsTable(items)}
    
    <!-- Total -->
    <div style="text-align: right; margin: 20px 0;">
      <p style="font-size: 20px; color: #14b8a6; font-weight: bold; margin: 0;">
        Total: ${formatCurrency(totalAmount)}
      </p>
      ${paymentMethod === 'COD' ? '<p style="color: #f59e0b; font-size: 14px; margin: 5px 0 0 0;">💵 Pay on delivery</p>' : '<p style="color: #10b981; font-size: 14px; margin: 5px 0 0 0;">✓ Paid</p>'}
    </div>
    
    <!-- Delivery Address -->
    ${address ? `
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="color: #92400e; margin: 0 0 10px 0;">📍 Delivery Address:</h4>
      <p style="color: #374151; margin: 0; white-space: pre-line;">${address}</p>
      ${phone ? `<p style="color: #374151; margin: 10px 0 0 0;">📞 ${phone}</p>` : ''}
    </div>
    ` : ''}
    
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
      We'll notify you once your order is shipped. Thank you for choosing ${STORE_NAME}!
    </p>
  `;

    try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            await transporter.sendMail({
                from: `"${STORE_NAME}" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Order Confirmed! #${orderId.slice(0, 8).toUpperCase()} - ${STORE_NAME}`,
                html: getBaseTemplate(content),
            });
            console.log(`[EMAIL] Order confirmation sent to ${email}`);
            return true;
        }
        console.log('[EMAIL] Email not configured, skipping order confirmation');
        return false;
    } catch (error) {
        console.error('[EMAIL_ERROR] Order confirmation failed:', error);
        return false;
    }
}

// Send order cancelled email
export async function sendOrderCancelledEmail(data: {
    orderId: string;
    name: string;
    email: string;
    reason?: string;
    items?: OrderItem[];
    totalAmount?: number;
}) {
    if (!isEmailEnabled()) return false;

    const { orderId, name, email, reason, items, totalAmount } = data;

    const content = `
    <h2 style="color: #dc2626; margin: 0 0 20px 0;">Order Cancelled ❌</h2>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Hello <strong>${name}</strong>,
    </p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Your order has been cancelled as requested.
    </p>
    
    <!-- Order Info -->
    <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; color: #dc2626; font-weight: 600;">Order ID: <span style="color: #374151;">#${orderId.slice(0, 8).toUpperCase()}</span></p>
      ${reason ? `<p style="margin: 10px 0 0 0; color: #dc2626; font-weight: 600;">Reason: <span style="color: #374151;">${reason}</span></p>` : ''}
    </div>
    
    ${items && items.length > 0 ? `
    <h3 style="color: #374151; margin: 30px 0 10px 0;">Cancelled Items:</h3>
    ${generateItemsTable(items)}
    ` : ''}
    
    ${totalAmount ? `
    <div style="text-align: right; margin: 20px 0;">
      <p style="font-size: 18px; color: #6b7280; font-weight: bold; margin: 0; text-decoration: line-through;">
        Total: ${formatCurrency(totalAmount)}
      </p>
    </div>
    ` : ''}
    
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: #92400e; margin: 0; font-size: 14px;">
        💡 If you paid online, your refund will be processed within 5-7 business days.
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
      We hope to see you again soon! If you have any questions, please don't hesitate to contact us.
    </p>
  `;

    try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            await transporter.sendMail({
                from: `"${STORE_NAME}" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Order Cancelled #${orderId.slice(0, 8).toUpperCase()} - ${STORE_NAME}`,
                html: getBaseTemplate(content),
            });
            console.log(`[EMAIL] Order cancelled sent to ${email}`);
            return true;
        }
        console.log('[EMAIL] Email not configured, skipping cancellation email');
        return false;
    } catch (error) {
        console.error('[EMAIL_ERROR] Order cancelled email failed:', error);
        return false;
    }
}

// Send refund request submitted email
export async function sendRefundRequestEmail(data: {
    orderId: string;
    refundId: string;
    name: string;
    email: string;
    reason: string;
    items?: OrderItem[];
    totalAmount?: number;
}) {
    if (!isEmailEnabled()) return false;

    const { orderId, refundId, name, email, reason, items, totalAmount } = data;

    const content = `
    <h2 style="color: #f59e0b; margin: 0 0 20px 0;">Refund Request Received 📝</h2>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Hello <strong>${name}</strong>,
    </p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      We've received your refund request and our team will review it shortly.
    </p>
    
    <!-- Refund Info -->
    <div style="background-color: #fffbeb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; color: #b45309; font-weight: 600;">Order ID: <span style="color: #374151;">#${orderId.slice(0, 8).toUpperCase()}</span></p>
      <p style="margin: 10px 0 0 0; color: #b45309; font-weight: 600;">Request ID: <span style="color: #374151;">#${refundId.slice(0, 8).toUpperCase()}</span></p>
      <p style="margin: 10px 0 0 0; color: #b45309; font-weight: 600;">Status: <span style="background-color: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px;">PENDING</span></p>
    </div>
    
    <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="color: #374151; margin: 0 0 10px 0;">📋 Reason for Refund:</h4>
      <p style="color: #6b7280; margin: 0; white-space: pre-line;">${reason}</p>
    </div>
    
    ${items && items.length > 0 ? `
    <h3 style="color: #374151; margin: 30px 0 10px 0;">Items in Order:</h3>
    ${generateItemsTable(items)}
    ` : ''}
    
    ${totalAmount ? `
    <div style="text-align: right; margin: 20px 0;">
      <p style="font-size: 18px; color: #374151; font-weight: bold; margin: 0;">
        Refund Amount: ${formatCurrency(totalAmount)}
      </p>
    </div>
    ` : ''}
    
    <div style="background-color: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: #1e40af; margin: 0; font-size: 14px;">
        ⏳ We'll review your request within 24-48 hours and notify you of the outcome.
      </p>
    </div>
  `;

    try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            await transporter.sendMail({
                from: `"${STORE_NAME}" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Refund Request Received #${refundId.slice(0, 8).toUpperCase()} - ${STORE_NAME}`,
                html: getBaseTemplate(content),
            });
            console.log(`[EMAIL] Refund request email sent to ${email}`);
            return true;
        }
        console.log('[EMAIL] Email not configured, skipping refund request email');
        return false;
    } catch (error) {
        console.error('[EMAIL_ERROR] Refund request email failed:', error);
        return false;
    }
}

// Send refund status update email
export async function sendRefundStatusEmail(data: {
    orderId: string;
    refundId: string;
    name: string;
    email: string;
    status: 'APPROVED' | 'REJECTED' | 'PROCESSED';
    adminNote?: string;
    totalAmount?: number;
}) {
    if (!isEmailEnabled()) return false;

    const { orderId, refundId, name, email, status, adminNote, totalAmount } = data;

    const statusConfig = {
        APPROVED: {
            color: '#10b981',
            bgColor: '#d1fae5',
            icon: '✅',
            title: 'Refund Approved!',
            message: 'Great news! Your refund request has been approved.',
        },
        REJECTED: {
            color: '#dc2626',
            bgColor: '#fee2e2',
            icon: '❌',
            title: 'Refund Request Declined',
            message: 'Unfortunately, your refund request could not be approved.',
        },
        PROCESSED: {
            color: '#14b8a6',
            bgColor: '#ccfbf1',
            icon: '💰',
            title: 'Refund Processed!',
            message: 'Your refund has been processed successfully.',
        },
    };

    const config = statusConfig[status];

    const content = `
    <h2 style="color: ${config.color}; margin: 0 0 20px 0;">${config.title} ${config.icon}</h2>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Hello <strong>${name}</strong>,
    </p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      ${config.message}
    </p>
    
    <!-- Refund Info -->
    <div style="background-color: ${config.bgColor}; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; color: ${config.color}; font-weight: 600;">Order ID: <span style="color: #374151;">#${orderId.slice(0, 8).toUpperCase()}</span></p>
      <p style="margin: 10px 0 0 0; color: ${config.color}; font-weight: 600;">Request ID: <span style="color: #374151;">#${refundId.slice(0, 8).toUpperCase()}</span></p>
      <p style="margin: 10px 0 0 0; color: ${config.color}; font-weight: 600;">Status: <span style="background-color: ${config.color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${status}</span></p>
    </div>
    
    ${adminNote ? `
    <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="color: #374151; margin: 0 0 10px 0;">📝 Note from Admin:</h4>
      <p style="color: #6b7280; margin: 0; white-space: pre-line;">${adminNote}</p>
    </div>
    ` : ''}
    
    ${totalAmount && status !== 'REJECTED' ? `
    <div style="text-align: center; margin: 20px 0;">
      <p style="font-size: 18px; color: ${config.color}; font-weight: bold; margin: 0;">
        Refund Amount: ${formatCurrency(totalAmount)}
      </p>
    </div>
    ` : ''}
    
    ${status === 'PROCESSED' ? `
    <div style="background-color: #d1fae5; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: #065f46; margin: 0; font-size: 14px;">
        ✅ Your refund of ${formatCurrency(totalAmount || 0)} will be credited to your original payment method within 5-7 business days.
      </p>
    </div>
    ` : ''}
    
    ${status === 'REJECTED' ? `
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: #92400e; margin: 0; font-size: 14px;">
        💬 If you have any questions about this decision, please contact our support team.
      </p>
    </div>
    ` : ''}
    
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
      Thank you for your patience. If you have any questions, please reach out to our support team.
    </p>
  `;

    try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            await transporter.sendMail({
                from: `"${STORE_NAME}" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `${config.title} #${refundId.slice(0, 8).toUpperCase()} - ${STORE_NAME}`,
                html: getBaseTemplate(content),
            });
            console.log(`[EMAIL] Refund status update (${status}) sent to ${email}`);
            return true;
        }
        console.log('[EMAIL] Email not configured, skipping refund status email');
        return false;
    } catch (error) {
        console.error('[EMAIL_ERROR] Refund status email failed:', error);
        return false;
    }
}

// Send order shipped email
export async function sendOrderShippedEmail(data: {
    orderId: string;
    name: string;
    email: string;
    trackingNumber?: string;
    items?: OrderItem[];
}) {
    if (!isEmailEnabled()) return false;

    const { orderId, name, email, trackingNumber, items } = data;

    const content = `
    <h2 style="color: #3b82f6; margin: 0 0 20px 0;">Your Order is on its Way! 🚚</h2>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Hello <strong>${name}</strong>,
    </p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Great news! Your order has been shipped and is on its way to you.
    </p>
    
    <!-- Order Info -->
    <div style="background-color: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; color: #1d4ed8; font-weight: 600;">Order ID: <span style="color: #374151;">#${orderId.slice(0, 8).toUpperCase()}</span></p>
      ${trackingNumber ? `<p style="margin: 10px 0 0 0; color: #1d4ed8; font-weight: 600;">Tracking Number: <span style="color: #374151;">${trackingNumber}</span></p>` : ''}
    </div>
    
    ${items && items.length > 0 ? `
    <h3 style="color: #374151; margin: 30px 0 10px 0;">Items Shipped:</h3>
    ${generateItemsTable(items)}
    ` : ''}
    
    <div style="background-color: #f0fdfa; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: #0d9488; margin: 0; font-size: 14px;">
        📦 Your package will arrive within 3-5 business days. We'll notify you once it's delivered!
      </p>
    </div>
  `;

    try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            await transporter.sendMail({
                from: `"${STORE_NAME}" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Your Order is Shipped! #${orderId.slice(0, 8).toUpperCase()} - ${STORE_NAME}`,
                html: getBaseTemplate(content),
            });
            console.log(`[EMAIL] Order shipped email sent to ${email}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('[EMAIL_ERROR] Order shipped email failed:', error);
        return false;
    }
}

// Send order delivered email
export async function sendOrderDeliveredEmail(data: {
    orderId: string;
    name: string;
    email: string;
    items?: OrderItem[];
}) {
    if (!isEmailEnabled()) return false;

    const { orderId, name, email, items } = data;

    const content = `
    <h2 style="color: #10b981; margin: 0 0 20px 0;">Your Order has been Delivered! 🎉</h2>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Hello <strong>${name}</strong>,
    </p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Great news! Your order has been successfully delivered. We hope your little one loves their new travel kit!
    </p>
    
    <!-- Order Info -->
    <div style="background-color: #d1fae5; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; color: #059669; font-weight: 600;">Order ID: <span style="color: #374151;">#${orderId.slice(0, 8).toUpperCase()}</span></p>
      <p style="margin: 10px 0 0 0; color: #059669; font-weight: 600;">Status: <span style="background-color: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">DELIVERED ✓</span></p>
    </div>
    
    ${items && items.length > 0 ? `
    <h3 style="color: #374151; margin: 30px 0 10px 0;">Delivered Items:</h3>
    ${generateItemsTable(items)}
    ` : ''}
    
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="color: #92400e; margin: 0; font-size: 16px; font-weight: 600;">
        ⭐ We'd love to hear your feedback!
      </p>
      <p style="color: #b45309; margin: 10px 0 0 0; font-size: 14px;">
        Share your experience with our travel kits
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
      Thank you for shopping with ${STORE_NAME}! We hope to see you again soon.
    </p>
  `;

    try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            await transporter.sendMail({
                from: `"${STORE_NAME}" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Order Delivered! #${orderId.slice(0, 8).toUpperCase()} - ${STORE_NAME}`,
                html: getBaseTemplate(content),
            });
            console.log(`[EMAIL] Order delivered email sent to ${email}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('[EMAIL_ERROR] Order delivered email failed:', error);
        return false;
    }
}
