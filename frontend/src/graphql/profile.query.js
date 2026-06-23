const PROFILE_QUERY = `
  query ProfileDashboard {
    profile {
      id
      name
      email
      role
      reward_points
      created_at
    }
    rewardBalance {
      reward_points
    }
    rewardHistory {
      id
      points
      type
      description
      createdAt
    }
    orders {
      id
      status
      total_amount
      created_at
    }
  }
`;

export default PROFILE_QUERY;
