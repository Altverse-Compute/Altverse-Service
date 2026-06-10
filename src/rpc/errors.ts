import grpc from "@grpc/grpc-js";

export const AuthenticationFailed = {
    code: grpc.status.INVALID_ARGUMENT,
    message: 'Authentication failed',
}

export const AccountAuthenticationFailed = {
    code: grpc.status.INVALID_ARGUMENT,
    message: 'Account authentication failed',
}

export const AwardAuthenticationFailed = {
    code: grpc.status.INVALID_ARGUMENT,
    message: 'Award authentication failed',
}