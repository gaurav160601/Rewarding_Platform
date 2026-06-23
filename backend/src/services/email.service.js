const orderShippedTemplate =
  require("../templates/orderShipped.template");

const orderDeliveredTemplate =
  require("../templates/orderDelivered.template");

const orderCancelledTemplate =
  require("../templates/orderCancelled.template");

const rewardEarnedTemplate =
  require("../templates/rewardEarned.template");

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

  async sendOrderShippedEmail(
    { email, orderId }
  ) {

    if (!resend) {
      console.log(
        `[EMAIL] Would send ORDER_SHIPPED to ${email} for order #${orderId}`
      );
      return;
    }

    const { subject, html } =
      orderShippedTemplate({
        orderId
      });

    await resend.emails.send({
      from: FROM,
      to: email,
      subject,
      html
    });
  }

  async sendOrderDeliveredEmail(
    { email, orderId }
  ) {

    if (!resend) {
      console.log(
        `[EMAIL] Would send ORDER_DELIVERED to ${email} for order #${orderId}`
      );
      return;
    }

    const { subject, html } =
      orderDeliveredTemplate({
        orderId
      });

    await resend.emails.send({
      from: FROM,
      to: email,
      subject,
      html
    });
  }

  async sendOrderCancelledEmail(
    { email, orderId }
  ) {

    if (!resend) {
      console.log(
        `[EMAIL] Would send ORDER_CANCELLED to ${email} for order #${orderId}`
      );
      return;
    }

    const { subject, html } =
      orderCancelledTemplate({
        orderId
      });

    await resend.emails.send({
      from: FROM,
      to: email,
      subject,
      html
    });
  }

  async sendRewardEarnedEmail(
    { email, points, balance }
  ) {

    if (!resend) {
      console.log(
        `[EMAIL] Would send REWARD_EARNED to ${email}: ${points} points, balance ${balance}`
      );
      return;
    }

    const { subject, html } =
      rewardEarnedTemplate({
        points,
        balance
      });

    await resend.emails.send({
      from: FROM,
      to: email,
      subject,
      html
    });
  }

}

module.exports =
new EmailService();
