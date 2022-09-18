import {SArray, SDecimal, SModel, SNumeric, SString, SDate, Identifier, Model, Property} from "../src";

/**
 * Another test model.
 */
class Author extends Model
{
	@Property(SString)
	name: string = undefined;

	@Property(SString)
	firstName: string = undefined;

	@Property(SString)
	email: string = undefined;

	@Property(SDate)
	createdAt: Date = undefined;

	constructor(name: string = undefined, firstName: string = undefined, email: string = undefined, createdAt: Date = undefined)
	{
		super();

		this.name = name;
		this.firstName = firstName;
		this.email = email;
		this.createdAt = createdAt;
	}
}

/**
 * A test model.
 */
class Article extends Model
{
	@Property(SNumeric)
	@Identifier
	id: number = undefined;

	@Property(SString)
	title: string = undefined;

	@Property(SArray(SModel(Author)))
	authors: Author[] = [];

	@Property(SString)
	text: string = undefined;

	@Property(SDecimal)
	evaluation: number = undefined;
}

it("deserialize", () => {
	expect((new Article()).deserialize({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test", createdAt: "2022-08-07T08:47:01.000Z", },
			{ name: "TEST", firstName: "Another", email: "another@test.test", createdAt: "2022-09-07T18:32:55.000Z", },
		],
		text: "this is a long test.",
		evaluation: "25.23",
	}).serialize()).toStrictEqual({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test", createdAt: "2022-08-07T08:47:01.000Z", },
			{ name: "TEST", firstName: "Another", email: "another@test.test", createdAt: "2022-09-07T18:32:55.000Z", },
		],
		text: "this is a long test.",
		evaluation: "25.23",
	});
});

it("create and check state then serialize", () => {
	const now = new Date();
	const article = new Article();
	article.id = 1;
	article.title = "this is a test";
	article.authors = [
		new Author("DOE", "John", "test@test.test", now),
	];
	article.text = "this is a long test.";
	article.evaluation = 25.23;

	expect(article.isNew()).toBeTruthy();
	expect(article.getIdentifier()).toStrictEqual(1);

	expect(article.serialize()).toStrictEqual({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test", createdAt: now.toISOString() },
		],
		text: "this is a long test.",
		evaluation: "25.23",
	});
});


it("deserialize then save", () => {
	const article = (new Article()).deserialize({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test", createdAt: new Date(), },
			{ name: "TEST", firstName: "Another", email: "another@test.test", createdAt: new Date(), },
		],
		text: "this is a long test.",
		evaluation: "25.23",
	});

	expect(article.isNew()).toBeFalsy();
	expect(article.isDirty()).toBeFalsy();
	expect(article.evaluation).toStrictEqual(25.23);

	article.text = "Modified text.";

	expect(article.isDirty()).toBeTruthy();

	expect(article.save()).toStrictEqual({
		id: 1,
		text: "Modified text.",
	});
});

it("save with modified submodels", () => {
	const article = (new Article()).deserialize({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test", createdAt: new Date(), },
			{ name: "TEST", firstName: "Another", email: "another@test.test", createdAt: new Date(), },
		],
		text: "this is a long test.",
		evaluation: "25.23",
	});

	article.authors = article.authors.map((author) => {
		author.name = "TEST";
		return author;
	});

	expect(article.save()).toStrictEqual({
		id: 1,
		authors: [
			{ name: "TEST", },
			{}, //{ name: "TEST", firstName: "Another", email: "another@test.test" },
		],
	});
});
