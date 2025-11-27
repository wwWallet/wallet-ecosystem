import { injectable } from "inversify";
import { OpenidForPresentationsConfiguration } from "../../services/types/OpenidForPresentationsConfiguration.type";
import { authorizationServerMetadataConfiguration } from "../../authorizationServiceConfiguration";
import { config } from "../../../config";
import { VerifierConfigurationInterface } from "../../services/interfaces";
import "reflect-metadata";

export const pidWithDocumentNumberDcqlQuery = {
	credentials: [
		{
			id: "PID",
			format: "dc+sd-jwt",
			meta: {
				vct_values: ["urn:eudi:pid:1"],
			},
			claims: [
				{
					path: ["document_number"],
				},
			],
		},
	],
};

export const pidMinimalDcqlQuery = {
	credentials: [
		{
			id: "PID",
			format: "dc+sd-jwt",
			meta: {
				vct_values: ["urn:eudi:pid:1"],
			},
			claims: [
				{
					path: ["family_name"],
				},
				{
					path: ["given_name"],
				},
				{
					path: ["birthdate"],
				},
			],
		},
	],
};


@injectable()
export class VerifierConfigurationService implements VerifierConfigurationInterface {


	getPresentationRequests(): any[] {
		return [
			{
				id: "PidWithDocumentNumber",
				title: "PidWithDocumentNumber",
				description: "You need to present your PID to prove your identity",
				dcql_query: pidWithDocumentNumberDcqlQuery
			},
			{
				id: "PidMinimal",
				title: "PidMinimal",
				description: "You need to present your PID to prove your identity",
				dcql_query: pidMinimalDcqlQuery
			}
		]
	}

	getConfiguration(): OpenidForPresentationsConfiguration {
		return {
			baseUrl: config.url,
			client_id: authorizationServerMetadataConfiguration.authorization_endpoint,
			redirect_uri: config.url + "/verification/direct_post",
			authorizationServerWalletIdentifier: "authorization_server",
		}
	}
}
