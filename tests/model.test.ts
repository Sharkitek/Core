import {describe, expect, it} from "vitest";
import {circular, defineModel, s} from "../src/library";

/**
 * Test class of an account.
 */
class Account {
	static model = s.defineModel({
		Class: Account,
		identifier: "id",
		properties: {
			id: s.property.numeric(),
			createdAt: s.property.date(),
			name: s.property.string(),
			email: s.property.string(),
			active: s.property.boolean(),
		},
	});

	id: number;
	createdAt: Date;
	name: string;
	email: string;
	active: boolean;
}

/**
 * Test class of an article.
 */
class Article {
	static model = s.defineModel({
		Class: Article,
		identifier: "id",
		properties: {
			id: s.property.numeric(),
			title: s.property.string(),
			authors: s.property.array(s.property.model(() => Account.model)),
			text: s.property.string(),
			evaluation: s.property.decimal(),
			tags: s.property.array(s.property.object({name: s.property.string()})),
			comments: s.property.array(s.property.model(() => ArticleComment.model)),
		},
	});

	id: number;
	title: string;
	authors: Account[];
	text: string;
	evaluation: number;
	tags: {name: string}[];
	comments: ArticleComment[];
}

/**
 * Test class of a comment on an article.
 */
class ArticleComment {
	static model = s.defineModel({
		Class: ArticleComment,
		identifier: "id",
		properties: {
			id: s.property.numeric(),
			article: s.property.model(circular<Article>(() => Article.model)),
			author: s.property.model(() => Account.model),
			message: s.property.string(),
		},
	});

	id: number;
	article?: Article;
	author: Account;
	message: string;
}

/**
 * Get a test account instance.
 */
function getTestAccount(): Account {
	const account = new Account();
	account.id = 52;
	account.createdAt = new Date();
	account.name = "John Doe";
	account.email = "john@doe.test";
	account.active = true;
	return account;
}

function getTestArticle(): Article {
	const article = new Article();
	article.id = 1;
	article.title = "this is a test";
	article.text = "this is a long test.";
	article.evaluation = 25.23;
	article.tags = [{name: "test"}, {name: "foo"}];
	article.authors = [getTestAccount()];
	article.comments = [];
	return article;
}

describe("model", () => {
	it("defines a new model, extending an existing one", () => {
		class ExtendedAccount extends Account {
			static extendedModel = s.extend(Account.model, {
				Class: ExtendedAccount,
				properties: {
					extendedProperty: s.property.string(),
				},
			});

			extendedProperty: string;
		}

		expect(ExtendedAccount.extendedModel.definition).toEqual({
			Class: ExtendedAccount,
			identifier: "id",
			properties: {
				id: s.property.numeric(),
				createdAt: s.property.date(),
				name: s.property.string(),
				email: s.property.string(),
				active: s.property.boolean(),
				extendedProperty: s.property.string(),
			},
		});
	});
	it("initializes a new model", () => {
		const article = getTestArticle();
		const newModel = Article.model.model(article);
		expect(newModel.instance).toBe(article);
	});
	it("gets a model state from its instance", () => {
		const article = getTestArticle();
		expect(Article.model.model(article).isNew()).toBeTruthy();
		expect(Article.model.model(article).isDirty()).toBeFalsy();
	});
	it("gets a model identifier value", () => {
		const article = getTestArticle();
		expect(Article.model.model(article).getIdentifier()).toBe(1);
	});
	it("gets a model composite identifier value", () => {
		class CompositeModel {
			static model = s.defineModel({
				Class: CompositeModel,
				properties: {
					firstId: s.property.numeric(),
					secondId: s.property.numeric(),
					label: s.property.string(),
				},
				identifier: ["firstId", "secondId"],
			});

			firstId: number;
			secondId: number;
			label: string;
		}

		expect(
			CompositeModel.model
				.model(
					Object.assign(new CompositeModel(), {
						firstId: 5,
						secondId: 6,
						label: "test",
					}),
				)
				.getIdentifier(),
		).toStrictEqual([5, 6]);
	});
	it("checks model dirtiness when altered, then reset diff", () => {
		const article = getTestArticle();
		expect(Article.model.model(article).isDirty()).toBeFalsy();
		article.title = "new title";
		expect(Article.model.model(article).isDirty()).toBeTruthy();
		Article.model.model(article).resetDiff();
		expect(Article.model.model(article).isDirty()).toBeFalsy();
	});

	it("deserializes a model from a serialized form", () => {
		const expectedArticle = Object.assign(new Article(), {
			id: 1,
			title: "this is a test",
			authors: [
				Object.assign(new Account(), {
					id: 52,
					name: "John Doe",
					email: "test@test.test",
					createdAt: new Date("2022-08-07T08:47:01.000Z"),
					active: true,
				}),
				Object.assign(new Account(), {
					id: 4,
					name: "Tester",
					email: "another@test.test",
					createdAt: new Date("2022-09-07T18:32:55.000Z"),
					active: false,
				}),
			],
			text: "this is a long test.",
			evaluation: 8.52,
			tags: [{name: "test"}, {name: "foo"}],
			comments: [
				Object.assign(new ArticleComment(), {
					id: 542,
					author: Object.assign(new Account(), {
						id: 52,
						name: "John Doe",
						email: "test@test.test",
						createdAt: new Date("2022-08-07T08:47:01.000Z"),
						active: true,
					}),
					message: "comment content",
				}),
			],
		});

		const deserializedArticle = Article.model.parse({
			id: 1,
			title: "this is a test",
			authors: [
				{
					id: 52,
					name: "John Doe",
					email: "test@test.test",
					createdAt: "2022-08-07T08:47:01.000Z",
					active: true,
				},
				{
					id: 4,
					name: "Tester",
					email: "another@test.test",
					createdAt: "2022-09-07T18:32:55.000Z",
					active: false,
				},
			],
			text: "this is a long test.",
			evaluation: "8.52",
			tags: [{name: "test"}, {name: "foo"}],
			comments: [
				{
					id: 542,
					author: {
						id: 52,
						name: "John Doe",
						email: "test@test.test",
						createdAt: "2022-08-07T08:47:01.000Z",
						active: true,
					},
					message: "comment content",
				},
			],
		});

		const deserializedArticleProperties = Article.model
			.model(deserializedArticle)
			.getInstanceProperties();
		delete deserializedArticleProperties.authors[0]._sharkitek;
		delete deserializedArticleProperties.authors[1]._sharkitek;
		delete deserializedArticleProperties.comments[0]._sharkitek;
		delete (deserializedArticleProperties.comments[0].author as any)._sharkitek;
		const expectedArticleProperties = Article.model
			.model(expectedArticle)
			.getInstanceProperties();
		delete expectedArticleProperties.authors[0]._sharkitek;
		delete expectedArticleProperties.authors[1]._sharkitek;
		delete expectedArticleProperties.comments[0]._sharkitek;
		delete (expectedArticleProperties.comments[0].author as any)._sharkitek;
		expect(deserializedArticleProperties).toEqual(expectedArticleProperties);
	});

	it("serializes an initialized model", () => {
		const article = getTestArticle();
		expect(Article.model.model(article).serialize()).toEqual({
			id: 1,
			title: "this is a test",
			text: "this is a long test.",
			evaluation: "25.23",
			tags: [{name: "test"}, {name: "foo"}],
			authors: [
				{
					id: 52,
					createdAt: article.authors[0].createdAt.toISOString(),
					name: "John Doe",
					email: "john@doe.test",
					active: true,
				},
			],
			comments: [],
		});
	});

	it("deserializes, changes and patches", () => {
		const deserializedArticle = Article.model.parse({
			id: 1,
			title: "this is a test",
			authors: [
				{
					id: 52,
					name: "John Doe",
					email: "test@test.test",
					createdAt: "2022-08-07T08:47:01.000Z",
					active: true,
				},
				{
					id: 4,
					name: "Tester",
					email: "another@test.test",
					createdAt: "2022-09-07T18:32:55.000Z",
					active: false,
				},
			],
			text: "this is a long test.",
			evaluation: "8.52",
			tags: [{name: "test"}, {name: "foo"}],
			comments: [
				{
					id: 542,
					author: {
						id: 52,
						name: "John Doe",
						email: "test@test.test",
						createdAt: "2022-08-07T08:47:01.000Z",
						active: true,
					},
					message: "comment content",
				},
			],
		});

		deserializedArticle.text = "A new text for a new life!";

		expect(Article.model.model(deserializedArticle).patch()).toStrictEqual({
			id: 1,
			text: "A new text for a new life!",
		});

		deserializedArticle.evaluation = 5.24;

		expect(Article.model.model(deserializedArticle).patch()).toStrictEqual({
			id: 1,
			evaluation: "5.24",
		});
	});

	it("patches with modified submodels", () => {
		const deserializedArticle = Article.model.parse({
			id: 1,
			title: "this is a test",
			authors: [
				{
					id: 52,
					name: "John Doe",
					email: "test@test.test",
					createdAt: "2022-08-07T08:47:01.000Z",
					active: true,
				},
				{
					id: 4,
					name: "Tester",
					email: "another@test.test",
					createdAt: "2022-09-07T18:32:55.000Z",
					active: false,
				},
			],
			text: "this is a long test.",
			evaluation: "8.52",
			tags: [{name: "test"}, {name: "foo"}],
			comments: [
				{
					id: 542,
					author: {
						id: 52,
						name: "John Doe",
						email: "test@test.test",
						createdAt: "2022-08-07T08:47:01.000Z",
						active: true,
					},
					message: "comment content",
				},
			],
		});

		deserializedArticle.authors[1].active = true;

		expect(Article.model.model(deserializedArticle).patch()).toStrictEqual({
			id: 1,
			authors: [{id: 52}, {id: 4, active: true}],
		});

		deserializedArticle.comments[0].author.name = "Johnny";

		expect(Article.model.model(deserializedArticle).patch()).toStrictEqual({
			id: 1,
			comments: [
				{
					id: 542,
					author: {
						id: 52,
						name: "Johnny",
					},
				},
			],
		});
	});

	it("deserializes and patches with fields that are not properties", () => {
		class TestModel {
			static model = defineModel({
				Class: TestModel,
				properties: {
					id: s.property.numeric(),
					label: s.property.string(),
				},
				identifier: "id",
			});

			id: number;
			label: string;

			notAProperty: {hello: string} = {hello: "world"};
		}

		const deserializedModel = TestModel.model.parse({
			id: 5,
			label: "testing",
		});
		expect(deserializedModel.id).toBe(5);
		expect(deserializedModel.label).toBe("testing");
		expect(deserializedModel.notAProperty?.hello).toBe("world");

		const clonedDeserializedModel = TestModel.model
			.model(deserializedModel)
			.clone();

		deserializedModel.label = "new!";
		expect(TestModel.model.model(deserializedModel).patch()).toStrictEqual({
			id: 5,
			label: "new!",
		});

		deserializedModel.notAProperty.hello = "monster";
		expect(TestModel.model.model(deserializedModel).patch()).toStrictEqual({
			id: 5,
		});

		expect(TestModel.model.model(deserializedModel).serialize()).toStrictEqual({
			id: 5,
			label: "new!",
		});

		expect(
			TestModel.model.model(clonedDeserializedModel).serialize(),
		).toStrictEqual({id: 5, label: "testing"});
		expect(clonedDeserializedModel.notAProperty.hello).toEqual("world");
	});

	it("assigns properties, ignoring fields which are not properties", () => {
		const deserializedArticle = Article.model.parse({
			id: 1,
			title: "this is a test",
			authors: [
				{
					id: 52,
					name: "John Doe",
					email: "test@test.test",
					createdAt: "2022-08-07T08:47:01.000Z",
					active: true,
				},
				{
					id: 4,
					name: "Tester",
					email: "another@test.test",
					createdAt: "2022-09-07T18:32:55.000Z",
					active: false,
				},
			],
			text: "this is a long test.",
			evaluation: "8.52",
			tags: [{name: "test"}, {name: "foo"}],
			comments: [
				{
					id: 542,
					author: {
						id: 52,
						name: "John Doe",
						email: "test@test.test",
						createdAt: "2022-08-07T08:47:01.000Z",
						active: true,
					},
					message: "comment content",
				},
			],
		});

		// Assign title and text, html is silently ignored.
		Article.model.model(deserializedArticle).assign({
			title: "something else",
			text: "fully new text! yes!",
			html: "<p>fully new text! yes!</p>",
		});
		expect((deserializedArticle as any)?.html).toBeUndefined();
		expect(Article.model.model(deserializedArticle).patch()).toStrictEqual({
			id: 1,
			title: "something else",
			text: "fully new text! yes!",
		});
	});

	it("initializes a model from properties values", () => {
		const testArticle = Article.model.from({
			title: "this is a test",
			authors: [
				Account.model.from({
					name: "John Doe",
					email: "test@test.test",
					createdAt: new Date(),
					active: true,
				}),
			],
			text: "this is a long text",
			evaluation: 8.52,
			tags: [{name: "test"}, {name: "foo"}],

			unknownField: true,
			anotherOne: "test",
		});

		expect(testArticle.title).toBe("this is a test");
		expect(testArticle.text).toBe("this is a long text");
		expect(testArticle.evaluation).toBe(8.52);
		expect(testArticle.authors).toHaveLength(1);
		expect(testArticle.authors[0]?.name).toBe("John Doe");
		expect((testArticle as any).unknownField).toBeUndefined();
		expect((testArticle as any).anotherOne).toBeUndefined();
	});

	it("applies patches to an existing model", () => {
		const testArticle = Article.model.from({
			id: 1,
			title: "this is a test",
			authors: [
				Account.model.from({
					id: 55,
					name: "John Doe",
					email: "test@test.test",
					createdAt: new Date(),
					active: true,
				}),
			],
			text: "this is a long text",
			evaluation: 8.52,
			tags: [{name: "test"}, {name: "foo"}],

			unknownField: true,
			anotherOne: "test",
		});
		Article.model.model(testArticle).resetDiff();

		// Test simple patch.
		Article.model.model(testArticle).applyPatch({
			title: "new title",
		});
		expect(testArticle.title).toBe("new title");
		expect(Article.model.model(testArticle).serializeDiff()).toStrictEqual({
			id: 1,
		});

		// Test originals update propagation.
		Article.model.model(testArticle).applyPatch({
			authors: [{email: "john@test.test"}],
		});
		expect(testArticle.authors[0].email).toBe("john@test.test");
		expect(Article.model.model(testArticle).serializeDiff()).toStrictEqual({
			id: 1,
		});

		// Test without originals update.
		Article.model.model(testArticle).applyPatch(
			{
				authors: [{name: "Johnny"}],
			},
			false,
		);
		expect(testArticle.authors[0].name).toBe("Johnny");
		expect(Article.model.model(testArticle).serializeDiff()).toStrictEqual({
			id: 1,
			authors: [{id: 55, name: "Johnny"}],
		});
	});
});
