/**
 * This list was mainly constructed using possible Betfair market types and how they can translate to other exchanges
 * Who do not use such elaborate market types (i.e. Matchbook)
 *
 * This list was helped constructed by referring to: http://sportsarbitrageguide.com/blog/uncategorized/bet-types-and-betting-markets-an-explanation/
 */

export default [
	{
		// There are 3 possible outcomes/runners... home/away/draw
		actualType: "ONE_X_TWO",
		potentialTypes: ["BOOKING_ODDS", "CORNER_MATCH_BET", "CORNER_ODDS", "DOUBLE_CHANCE", "HALF_TIME", "MATCH_ODDS", "NEXT_GOAL"]
	},
	// The markets listed below are just ones that had a very high amount of runners
	// so you had many to choose from and I thought that mapped to outright somehow...
	//
	/**
	 * " Outright bet is a bet placed on the outcome of an entire league or competition rather than on an individual game.
	 *   Outright bets are usually placed before the season starts but are also available even during the course of the competition. "
	 *
	 * " These kinds of bets are characterized by much higher returns when compared to regular match bets and as such are
	 *   very appealing to a huge number of sports punters. "
	 *
	 * " Besides betting on a winner of the competition, you can predict team’s
	 *   finishing position, bet on a number of season points or back a player to score most goals. The number of outright bets
	 *   is increasing every season and these are becoming extremely popular among the players. "
	 */
	{
		actualType: "OUTRIGHT",
		potentialTypes: [
			"FIRST_GOAL_SCORER",
			"GROUP_WINNER",
			"ROCK_BOTTOM",
			"SCORE_CAST",
			"SHOWN_A_CARD",
			"TO_REACH_FINAL",
			"TO_SCORE",
			"TO_SCORE_HATTRICK",
			"TO_SCORE_2_OR_MORE",
			"TOP_GOALSCORER",
			"TOP_N_FINISH",
			"WINCAST",
			"WINNER",
			"WINNING_MARGIN"
		]
	},
	{
		actualType: "MONEYLINE",
		potentialTypes: [
			"DRAW_NO_BET", // American sportsbook will often call this Moneyline, refering to how much money you need to bet to win
			"MONEY_LINE",
			"ZERO_POINT_HANDICAP" // I doubt this market type exists with my exchanges but a +0/-0 handicap is the same as a 'Draw-no-bet' scenario
		]
	},
	// If a draw comes in, the exchange will either PUSH your bet so you get your entire stake back or...
	// The will invoke the "Dead Heat Rule" meaning you only get 50% of your bet returned
	{
		actualType: "ASIAN_HANDICAP", // This is when there are only 2 runners (Team A/Team B)
		potentialTypes: [
			// There is a non-whole integer handicap so that a draw outcome is impossible (i.e. +0.5)
			//
			// Half Point handicap removes all chance of a push/dead heat result
			// For arbs, half points are very useful whereas quarter/three quarter can be more difficult...
			// Quarter          = Team A (+/-0.25) / Team A (+0/+0.5) - The latter is what it looks like on Matchbook
			// Three Quarter    = Team A (+/-0.75) / Team A (+0/+0.5) - So there is no difference in how quarter/three-quarter can look?
			//
			// With 'Goal Lines', this is 'Over (+0/+0.5)'
			// The absence of a whole number makes it an Asian Handicap bet
			// If you go into the 'Goal Lines' market on the exchange, it shows both these markets & 'Over/Under' for goals
			// On betfair, the betting type on this market is ASIAN_HANDICAP_DOUBLE_LINE
			"ALT_TOTAL_GOALS"
		]
	},
	{
		actualType: "HANDICAP",
		potentialTypes: [
			"TEAM_A_1",
			"TEAM_A_2",
			"TEAM_A_3",
			"TEAM_B_1",
			"TEAM_B_2",
			"TEAM_B_3",
			// The one below has runner names such as '1 or more goals'
			// On betfair, this has the betting type of ASIAN_HANDICAP_SINGLE_LINE
			// Because these work on WHOLE numbers (I worked it as 'Over 1'), I put them in this market type
			// As opposed to Asian Handicaps which deal in NON-WHOLE numbers
			"TEAM_TOTAL_GOALS",
			"TOTAL_GOALS"
		]
	},
	{
		actualType: "TOTAL_SCORE",
		potentialTypes: [
			"OVER_UNDER_85",
			"FIRST_HALF_GOALS_25",
			"FIRST_HALF_GOALS_15",
			"OVER_UNDER_05",
			"OVER_UNDER_65",
			"FIRST_HALF_GOALS_05",
			"OVER_UNDER_15",
			"OVER_UNDER_35",
			"OVER_UNDER_55",
			"OVER_UNDER_45",
			"OVER_UNDER_25",
			"OVER_UNDER_75",
			"ODD_OR_EVEN",
			"TO_QUALIFY",
			"OVER_UNDER_105_CORNR",
			"OVER_UNDER_135_CORNR",
			"OVER_UNDER_45_CARDS",
			"OVER_UNDER_85_CORNR",
			"TEAM_B_OVER_UNDER_15",
			"TEAM_B_OVER_UNDER_25",
			"TEAM_A_OVER_UNDER_25",
			"TEAM_B_OVER_UNDER_05",
			"TEAM_A_OVER_UNDER_05",
			"TEAM_A_OVER_UNDER_15",
			"OVER_UNDER_55_CORNR",
			"OVER_UNDER_35_CARDS",
			"OVER_UNDER_65_CARDS",
			"OVER_UNDER_25_CARDS"
			// What will be best here is a partial match that if the market type includes "OVER_UNDER_" then return this type
			// Also want this to include markets for First Half goals of which the rule for Betfair will be 'FIRST_HALF_GOALS_'
			// Another one...will be '_WIN_TO_NIL' as that is a points based market with 2 runners
			//
			// Bookies usually offer odds on 'Over/Under' markets
			// Usually 2-way bets which use half point to rule out any chance of a push
		]
	},
	{
		actualType: "CORRECT_SCORE",
		potentialTypes: ["HALF_TIME_SCORE"]
	},
	{
		actualType: "HALF_TIME_FULL_TIME",
		potentialTypes: [
			// This should be a market of it's own...
		]
	},
	{
		actualType: "YES_NO",
		potentialType: [
			"SENDING_OFF",
			"BOTH_TEAMS_TO_SCORE",
			"HAT_TRICKED_SCORED",
			"TEAM_B_WIN_TO_NIL",
			"TEAM_A_WIN_TO_NIL",
			"WIN_BOTH_HALVES",
			"TO_SCORE_BOTH_HALVES",
			"CLEAN_SHEET",
			"PENALTY_TAKEN"
		]
	}
];
