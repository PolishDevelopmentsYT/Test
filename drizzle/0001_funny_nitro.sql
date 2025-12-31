CREATE TABLE `ai_models` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`provider` varchar(100) NOT NULL,
	`modelId` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`isActive` int NOT NULL DEFAULT 1,
	`eloRating` int NOT NULL DEFAULT 1500,
	`totalBattles` int NOT NULL DEFAULT 0,
	`totalWins` int NOT NULL DEFAULT 0,
	`totalLosses` int NOT NULL DEFAULT 0,
	`totalDraws` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_models_id` PRIMARY KEY(`id`),
	CONSTRAINT `provider_model_idx` UNIQUE(`provider`,`modelId`)
);
--> statement-breakpoint
CREATE TABLE `battle_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modelId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`battlesCount` int NOT NULL DEFAULT 0,
	`winsCount` int NOT NULL DEFAULT 0,
	`lossesCount` int NOT NULL DEFAULT 0,
	`drawsCount` int NOT NULL DEFAULT 0,
	`avgResponseTime` float,
	`totalVotes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `battle_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `model_date_idx` UNIQUE(`modelId`,`date`)
);
--> statement-breakpoint
CREATE TABLE `battle_topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`prompt` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`isActive` int NOT NULL DEFAULT 1,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `battle_topics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `battles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`model1Id` int NOT NULL,
	`model2Id` int NOT NULL,
	`topicId` int NOT NULL,
	`customPrompt` text,
	`model1Response` text,
	`model2Response` text,
	`model1ResponseTime` int,
	`model2ResponseTime` int,
	`winnerId` int,
	`status` enum('pending','completed','error') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `battles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`favoriteModels` text,
	`emailNotifications` int NOT NULL DEFAULT 1,
	`battleReminders` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`battleId` int NOT NULL,
	`userId` int NOT NULL,
	`votedModelId` int,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `votes_id` PRIMARY KEY(`id`),
	CONSTRAINT `battle_user_idx` UNIQUE(`battleId`,`userId`)
);
--> statement-breakpoint
CREATE INDEX `elo_idx` ON `ai_models` (`eloRating`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `battle_stats` (`date`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `battle_topics` (`category`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `battles` (`userId`);--> statement-breakpoint
CREATE INDEX `model1_idx` ON `battles` (`model1Id`);--> statement-breakpoint
CREATE INDEX `model2_idx` ON `battles` (`model2Id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `battles` (`status`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `battles` (`createdAt`);--> statement-breakpoint
CREATE INDEX `battle_idx` ON `votes` (`battleId`);