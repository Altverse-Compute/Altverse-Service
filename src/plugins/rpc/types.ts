import type {ProtoGrpcType} from "@proto/ts/rpc.ts";

export type AuthenticationRequest = ProtoGrpcType["connection"]["AuthenticationRequest"]
export type AuthenticationResponse = ProtoGrpcType["connection"]["AuthenticationResponse"]
export type PingRequest = ProtoGrpcType["connection"]["PingRequest"]
export type PongResponse = ProtoGrpcType["connection"]["PongResponse"]
export type JoinPlayerRequest = ProtoGrpcType["connection"]["JoinPlayerRequest"]
export type JoinPlayerResponse = ProtoGrpcType["connection"]["JoinPlayerResponse"]
export type AwardRequest = ProtoGrpcType["connection"]["AwardRequest"]
export type AwardResponse = ProtoGrpcType["connection"]["AwardResponse"]

