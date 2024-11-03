import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
	UserPoolId: "us-east-1_8KF54hE7w",
	ClientId: "7g7o7da101b05c35j71o46eou1",
};

export const userPool = new CognitoUserPool(poolData);
