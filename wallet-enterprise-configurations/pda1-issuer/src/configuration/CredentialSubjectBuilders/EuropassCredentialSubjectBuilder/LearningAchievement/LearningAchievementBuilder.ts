
export type LearningAchievement = {
	id: string;
	title: string;
	issuedDate: string; // date received the actual diploma
}


export interface LearningAchievementBuilderInterface {
	build(): LearningAchievement;
}

export class LearningAchievementBuilder implements LearningAchievementBuilderInterface {

	learningAchievement: Partial<LearningAchievement> = { };


	build(): LearningAchievement {
		return this.learningAchievement as LearningAchievement;
		
	}
}

