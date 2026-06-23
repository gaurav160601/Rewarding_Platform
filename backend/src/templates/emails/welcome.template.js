function welcomeTemplate({ name }) {
  return {
    subject: "Welcome to Rewarding Platform",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome, ${name}!</h2>
        <p>Thank you for joining Rewarding Platform.</p>
        <p>Start shopping and earn reward points on every purchase.</p>
        <p><a href="${process.env.CLIENT_URL || "http://localhost:5173"}/login" style="color: #2563eb;">Login to your account</a></p>
      </div>
    `
  };
}

module.exports = welcomeTemplate;
