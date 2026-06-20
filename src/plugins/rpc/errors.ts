import grpc from "@grpc/grpc-js";

export const AuthenticationFailed = {
    code: grpc.status.INVALID_ARGUMENT,
    message: 'Authentication failed',
}

export const AuthenticationAlreadyLoginedFailed = {
    code: grpc.status.INVALID_ARGUMENT,
    message: 'Authentication failed. Server already is logined',
}

export const AuthenticationPingFailed = {
    code: grpc.status.INVALID_ARGUMENT,
    message: 'Authentication ping failed',
}

export const AuthenticationJoinPlayerFailed = {
    code: grpc.status.INVALID_ARGUMENT,
    message: 'Authenticataion join player failed',
}

export const AccountAuthenticationFailed = {
    code: grpc.status.INVALID_ARGUMENT,
    message: 'Account authentication failed',
}

export const AwardAuthenticationFailed = {
    code: grpc.status.INVALID_ARGUMENT,
    message: 'Award authentication failed',
}