const REDEEM_POINTS = `
  mutation RedeemPoints($points: Int!) {
    redeemPoints(points: $points) {
      success
      balance
    }
  }
`;

export default REDEEM_POINTS;
