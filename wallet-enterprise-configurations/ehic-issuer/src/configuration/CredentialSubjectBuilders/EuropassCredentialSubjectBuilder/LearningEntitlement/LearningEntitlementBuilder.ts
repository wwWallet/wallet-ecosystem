import { LearningAchievement } from "../LearningAchievement/LearningAchievementBuilder";


export type LearningEntitlement = {
	id: string;
	title: string;
	issuedDate: string; // date received the actual diploma
	wasDerivedFrom: LearningAchievement
}


export interface LearningEntitlementBuilderInterface {
	setId(id: string): this;
	setTitle(title: string): this;
	setIssuedDate(issuedDate: Date): this;

	build(): LearningEntitlement;
}

export class LearningEntitlementBuilder implements LearningEntitlementBuilderInterface {

	private learningEntitlement: Partial<LearningEntitlement> = { };

	setId(id: string) {
		this.learningEntitlement.id = id;
		return this;
	}


	setTitle(title: string): this {
		this.learningEntitlement.title = title;
		return this;
	}

	setIssuedDate(issuedDate: Date): this {
		this.learningEntitlement.issuedDate = issuedDate.toISOString();
		return this;
	}

	build(): LearningEntitlement {
		return this.learningEntitlement as LearningEntitlement;
		
	}
}

