import {SArray, SDecimal, SModel, SNumeric, SString, Identifier, Model, Property} from "../src";

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

	constructor(name: string = undefined, firstName: string = undefined, email: string = undefined)
	{
		super();

		this.name = name;
		this.firstName = firstName;
		this.email = email;
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
			{ name: "DOE", firstName: "John", email: "test@test.test" },
			{ name: "TEST", firstName: "Another", email: "another@test.test" },
		],
		text: "this is a long test.",
		evaluation: "25.23",
	}).serialize()).toStrictEqual({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test" },
			{ name: "TEST", firstName: "Another", email: "another@test.test" },
		],
		text: "this is a long test.",
		evaluation: "25.23",
	});
});

it("create and check state then serialize", () => {
	const article = new Article();
	article.id = 1;
	article.title = "this is a test";
	article.authors = [
		new Author("DOE", "John", "test@test.test"),
	];
	article.text = "this is a long test.";
	article.evaluation = 25.23;

	expect(article.isNew()).toBeTruthy();
	expect(article.getIdentifier()).toStrictEqual(1);

	expect(article.serialize()).toStrictEqual({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test" },
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
			{ name: "DOE", firstName: "John", email: "test@test.test" },
			{ name: "TEST", firstName: "Another", email: "another@test.test" },
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
			{ name: "DOE", firstName: "John", email: "test@test.test" },
			{ name: "TEST", firstName: "Another", email: "another@test.test" },
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
