const orderShippedTemplate =
  require("../templates/orderShipped.template");

const orderDeliveredTemplate =
  require("../templates/orderDelivered.template");

const orderCancelledTemplate =
  require("../templates/orderCancelled.template");

const rewardEarnedTemplate =
  require("../templates/rewardEarned.template");

const welcomeTemplate =
  require("../templates/emails/welcome.template");

const orderCreatedTemplate =
  require("../templates/emails/orderCreated.template");

const paymentSuccessTemplate =
  require("../templates/emails/paymentSuccess.template");

const refundProcessedTemplate =
  require("../templates/emails/refundProcessed.template");

let resend = null;

if (process.env.RESEND_API_KEY) {
  const { Resend } = require("resend");
  resend = new Resend(
    process.env.RESEND_API_KEY
  );
}

const FROM =
  process.env.EMAIL_FROM ||
  "noreply@rewardingplatform.com";

class EmailService {

  async sendEmail({ to, subject, html }) {
    if (!resend) {
      console.log(
        `[EMAIL] Would send "${subject}" to ${to}`
      );
      return;
    }
    await resend.emails.send({
      from: FROM,
      to,
      subject,
      html
    });
  }

  async sendWelcomeEmail({ email, name }) {
    const { subject, html } =
      welcomeTemplate({ name });
    await this.sendEmail({ to: email, subject, html });
  }

  async sendOrderCreatedEmail({ email, orderId, totalAmount, redeemedPoints, finalAmount }) {
    const { subject, html } =
      orderCreatedTemplate({ orderId, totalAmount, redeemedPoints, finalAmount });
    await this.sendEmail({ to: email, subject, html });
  }

  async sendPaymentSuccessEmail({ email, orderId, amount, earnedPoints }) {
    const { subject, html } =
      paymentSuccessTemplate({ orderId, amount, earnedPoints });
    await this.sendEmail({ to: email, subject, html });
  }

  async sendRefundProcessedEmail({ email, orderId, refundAmount, refundTransactionId }) {
    const { subject, html } =
      refundProcessedTemplate({ orderId, refundAmount, refundTransactionId });
    await this.sendEmail({ to: email, subject, html });
  }

  async sendOrderShippedEmail({ email, orderId }) {
    const { subject, html } =
      orderShippedTemplate({ orderId });
    await this.sendEmail({ to: email, subject, html });
  }

  async sendOrderDeliveredEmail({ email, orderId }) {
    const { subject, html } =
      orderDeliveredTemplate({ orderId });
    await this.sendEmail({ to: email, subject, html });
  }

  async sendOrderCancelledEmail({ email, orderId, refundAmount, refundStatus, returnedPoints, reversedPoints }) {
    const { subject, html } =
      orderCancelledTemplate({ orderId, refundAmount, refundStatus, returnedPoints, reversedPoints });
    await this.sendEmail({ to: email, subject, html });
  }

  async sendRewardEarnedEmail({ email, points, balance }) {
    const { subject, html } =
      rewardEarnedTemplate({ points, balance });
    await this.sendEmail({ to: email, subject, html });
  }
}

module.exports =
  new EmailService();
