/**
 * This list was mainly constructed using possible Betfair market types and how they can translate to other exchanges
 * Who do not use such elaborate market types (i.e. Matchbook)
 *
 * This list was helped constructed by referring to: http://sportsarbitrageguide.com/blog/uncategorized/bet-types-and-betting-markets-an-explanation/
 */

/**
 * Equivalences & Market Overlaps
 *
 * A 'Double Chance' bet which covers 1 team with the draw (Team A or Draw) is equivalent to a +0.5 Asian Handicap on that same team:
 *
 * Team A wins 1-0 so your Double Chance comes in as well as your Asian Handicap bet
 * It is a draw 1-1 so your Handicap comes in when applied as well as your Double Chance on the draw
 * Team B wins 1-0 so you lose your Double Chance & your Handicap as well
 *
 * A -0.5 handicap (on Team A) is the same as ONE_X_TWO bet on the same team:
 *
 * Team A wins 1-0 so win ONE_X_TWO and due to half point, still win handicap
 * Draw results in a loss of both bets
 * Team B wins 1-0 so lose ONE_X_TWO as well as lose handicap
 *
 * No team to score === correct score of 0-0... obvs
 *
 * As such, it is easy to see that a +0.5 handicap can be used with a 3-way ONE_X_TWO bet to create a simple 2-way bet arb
 * (as the ONE or the TWO is ONE_X_TWO === -0.5 handicap)
 * Similarly, a Double Chance bet can be easily used with a -0.5 handicap, or with a draw bet to create an arb
 *
 *
 *
 * A lot of events have the market types;
 *
 * - SPECIAL
 * - UNDIFFERENTIATED
 *
 * For now I am going to leave these be but worth looking into them so I can categorise them
 *
 *
 * I have attempted to categorise these markets via the number of runners that they have
 * I did this by comparing on Betfair exchange
 */

export default [
	{
		// There are 3 possible outcomes/runners... home/away/draw
		actualType: "ONE_X_TWO",
		potentialTypes: [
			// Football/Rugby Union/Rugby League/Boxing
			"MATCH_ODDS",
			// Football
			"BOOKING_ODDS",
			"CORNER_MATCH_BET",
			"CORNER_ODDS",
			"DOUBLE_CHANCE",
			"HALF_TIME",
			"NEXT_GOAL",
			// Golf
			"THREE_BALLS",
			// Cricket
			"MATCH_ODDS_LO_TIE",
			"TO_WIN_THE_TOSS"
		]
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
			// Football/Golf
			"TOP_N_FINISH",
			// Football
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
			"WINCAST",
			"WINNER",
			// Football/Rugby Union
			"WINNING_MARGIN",
			// Tennis/Basketball/Cricket/American Football
			"TOURNAMENT_WINNER",
			// Rugby Union/Rugby League/Baseball/Cycling
			"OUTRIGHT_WINNER",
			// Golf
			"WINNER",
			"EACH_WAY",
			"ROUND_LEADER",
			// Cricket
			"SERIES_WINNER",
			"TOP_BATSMAN"
		]
	},
	// These are only 2-way markets (markets with 2 runners). Euther Team/Player A wins or Team/Player B wins...
	// It ignores the draw outcome
	// If the draw is possible and happens, bet will either be PUSHed so get stake back or...
	// "Dead Heat Rule" will only give you 50% of stake back
	{
		actualType: "ONE_TWO",
		potentialTypes: [
			// Football/Cricket
			"DRAW_NO_BET", // American sportsbook will often call this Moneyline, refering to how much money you need to bet to win
			// Football/Rugby League
			"TO_QUALIFY",
			// Football
			"MONEY_LINE",
			// Tennis/Basketball/Cricket/Snooker
			"MATCH_ODDS", // Match cannot end as a draw which voids that it is a ONE_X_TWO market
			// Tennis
			"SET_WINNER",
			"NUMBER_OF_SETS",
			"GAME_BY_GAME_03_06",
			"GAME_BY_GAME_02_06",
			"GAME_BY_GAME_03_05",
			"GAME_BY_GAME_02_05",
			"GAME_BY_GAME_02_04",
			"GAME_BY_GAME_03_04",
			"GAME_BY_GAME_02_03",
			"GAME_BY_GAME_03_03",
			"GAME_BY_GAME_02_02",
			"GAME_BY_GAME_03_02",
			"GAME_BY_GAME_02_12",
			"GAME_BY_GAME_03_11",
			"GAME_BY_GAME_02_11",
			"GAME_BY_GAME_03_10",
			"GAME_BY_GAME_02_10",
			"GAME_BY_GAME_02_09",
			"GAME_BY_GAME_03_09",
			"GAME_BY_GAME_02_08",
			"GAME_BY_GAME_03_08",
			"GAME_BY_GAME_03_07",
			"GAME_BY_GAME_02_07",
			"GAME_BY_GAME_03_13",
			"GAME_BY_GAME_02_13",
			"GAME_BY_GAME_03_12",
			"GAME_BY_GAME_03_01",
			"GAME_BY_GAME_02_01",
			"GAME_BY_GAME_01_08",
			"GAME_BY_GAME_01_07",
			"GAME_BY_GAME_01_06",
			"GAME_BY_GAME_01_05",
			"GAME_BY_GAME_01_04",
			"GAME_BY_GAME_01_13",
			"GAME_BY_GAME_01_12",
			"GAME_BY_GAME_01_11",
			"GAME_BY_GAME_01_10",
			"GAME_BY_GAME_01_09",
			"GAME_BY_GAME_01_03",
			"GAME_BY_GAME_01_02",
			"GAME_BY_GAME_01_01",
			// Basketball
			"QUARTER_MATCH_ODDS",
			"HALF_MATCH_ODDS",
			// Golf
			"TOURN_MATCHBET_NOTIE"
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
			// Football
			"ALT_TOTAL_GOALS",
			// Basketball
			"QUARTER_HANDICAP",
			"HALF_HANDICAP"
		]
	},
	// This market type was supposed to be for whole number handicaps but now I am having a rethink...
	// The actual market types of these markets are not given a handicap by Betfair (betting type = 'ODDS')
	// However, the market names of TEAM_A_1 (for example) are 'Team A (+1)' which to me is a handicap...
	//
	// There are a lot of events that have this specific market type so they will match these as well
	// Starting to think that the ones here currently do not match this market...
	{
		actualType: "HANDICAP",
		potentialTypes: [
			// Football
			"TEAM_A_1",
			"TEAM_A_2",
			"TEAM_A_3",
			"TEAM_B_1",
			"TEAM_B_2",
			"TEAM_B_3"
		]
	},
	// Bookies usually offer odds on 'Over/Under' markets
	// Usually 2-way bets which use HALF point to rule out any chance of a PUSH
	// What is the difference between these and ONE_TWO betting when going off the number of runners?
	{
		actualType: "TOTAL_SCORE",
		potentialTypes: [
			// Football
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
		]
	},
	{
		actualType: "CORRECT_SCORE",
		potentialTypes: [
			// Football
			"HALF_TIME_SCORE",
			"TEAM_TOTAL_GOALS",
			"TOTAL_GOALS",
			// Tennis
			"SET_BETTING",
			"SET_CORRECT_SCORE",
			// Cricket
			"TOTAL_SIXES",
			"TOTAL_FOURS",
			"HIGHEST_OVER_TOTAL",
			"INNINGS_RUNS",
			"FIRST_OVER_RUNS",
			"1ST_INNINGS_RUNS_A",
			"1ST_INNINGS_RUNS_B",
			"2ND_INNINGS_RUNS_A",
			"2ND_INNINGS_RUNS",
			"1ST_INNINGS_RUNS",
			// Boxing
			"ROUND_BETTING",
			"METHOD_OF_VICTORY",
			// Tennis/Basketball/Rugby Union
			"COMBINED_TOTAL"
		]
	},
	{
		actualType: "HALF_TIME_FULL_TIME",
		potentialTypes: [
			// Football
			// Rugby Union
		]
	},
	// Is this not essentially ONE_TWO markets? - It is just a way to separate them
	// They only have 2 runners
	// I am starting to base these off of the number of runners in each market and am not sure whether I should or not...
	{
		actualType: "YES_NO",
		potentialType: [
			// Football
			"SENDING_OFF",
			"BOTH_TEAMS_TO_SCORE",
			"HAT_TRICKED_SCORED",
			"TEAM_B_WIN_TO_NIL",
			"TEAM_A_WIN_TO_NIL",
			"WIN_BOTH_HALVES",
			"TO_SCORE_BOTH_HALVES",
			"CLEAN_SHEET",
			"PENALTY_TAKEN",
			"PLAYER_B_WIN_A_SET",
			"PLAYER_A_WIN_A_SET",
			// Cricket
			"COMPLETED_MATCH",
			"TIED_MATCH",
			// Boxing
			"GO_THE_DISTANCE"
		]
	}
];
