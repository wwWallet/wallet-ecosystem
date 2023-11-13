import { injectable } from "inversify";
import 'reflect-metadata';
import { CredentialIssuersRepository } from "../lib/CredentialIssuersRepository";
import { CredentialIssuersConfiguration } from "../services/interfaces";


@injectable()
export class CredentialIssuersConfigurationService implements CredentialIssuersConfiguration {


	public registeredCredentialIssuerRepository(): CredentialIssuersRepository {
		return new CredentialIssuersRepository([]);
	}


	public registeredClients(): { client_id: string; friendlyName: string; redirectUri: string; }[] {
		return [];
	}


	public defaultCredentialIssuerIdentifier(): string {
		return "";
	}
}