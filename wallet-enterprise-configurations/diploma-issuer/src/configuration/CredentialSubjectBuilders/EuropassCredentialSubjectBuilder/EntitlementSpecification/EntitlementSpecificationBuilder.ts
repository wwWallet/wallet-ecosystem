

export type EntitlementSpecification = {
	id: string;
	title: string;
	eqflLevel: string;
	grade: string;
	
}

export interface EntitlementSpecificationBuilderInterface {
	setId(id: string): this;
	setTitle(title: string): this;
	build(): EntitlementSpecification;
}

export class EntitlementSpecificationBuilder implements EntitlementSpecificationBuilderInterface {

	entitlementSpecification: Partial<EntitlementSpecification> = {};


	setId(id: string): this {
		this.entitlementSpecification.id = id;
		return this;
	}
	setTitle(title: string): this {
		this.entitlementSpecification.title = title;
		return this;
	}

	build(): EntitlementSpecification {
		return this.entitlementSpecification as EntitlementSpecification;
	}
}