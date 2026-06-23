function rewardEarnedTemplate({ points, balance }) {
  return {
    subject: "Reward Points Added",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reward Points Added</h2>
        <p>Congratulations!</p>
        <p>You earned <strong>${points}</strong> reward points.</p>
        <p><strong>Current Balance:</strong> ${balance} Points</p>
      </div>
    `
  };
}

module.exports = rewardEarnedTemplate;
