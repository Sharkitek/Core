import {s} from "../src";

/**
 * Another test model.
 */
class Author extends s.model({
	name: s.property.string(),
	firstName: s.property.string(),
	email: s.property.string(),
	createdAt: s.property.date(),
	active: s.property.bool(),
}).extends({
	extension(): string
	{
		return this.name;
	}
})
{
	active: boolean = true;

	constructor(name: string = "", firstName: string = "", email: string = "", createdAt: Date = new Date())
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
class Article extends s.model({
	id: s.property.numeric(),
	title: s.property.string(),
	authors: s.property.array(s.property.model(Author)),
	text: s.property.string(),
	evaluation: s.property.decimal(),
	tags: s.property.array(
		s.property.object({
			name: s.property.string(),
		})
	),
}, "id")
{
	id: number;
	title: string;
	authors: Author[] = [];
	text: string;
	evaluation: number;
	tags: {
		name: string;
	}[];
}

it("deserialize", () => {
	expect((new Article()).deserialize({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test", createdAt: "2022-08-07T08:47:01.000Z", active: true, },
			{ name: "TEST", firstName: "Another", email: "another@test.test", createdAt: "2022-09-07T18:32:55.000Z", active: false, },
		],
		text: "this is a long test.",
		evaluation: "25.23",
		tags: [ {name: "test"}, {name: "foo"} ],
	}).serialize()).toStrictEqual({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test", createdAt: "2022-08-07T08:47:01.000Z", active: true, },
			{ name: "TEST", firstName: "Another", email: "another@test.test", createdAt: "2022-09-07T18:32:55.000Z", active: false, },
		],
		text: "this is a long test.",
		evaluation: "25.23",
		tags: [ {name: "test"}, {name: "foo"} ],
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
	article.tags = [];
	article.tags.push({name: "test"});
	article.tags.push({name: "foo"});

	expect(article.isNew()).toBeTruthy();
	expect(article.getIdentifier()).toStrictEqual(1);

	expect(article.serialize()).toStrictEqual({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test", createdAt: now.toISOString(), active: true, },
		],
		text: "this is a long test.",
		evaluation: "25.23",
		tags: [ {name: "test"}, {name: "foo"} ],
	});
});


it("deserialize then save", () => {
	const article = (new Article()).deserialize({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test", createdAt: (new Date()).toISOString(), active: true, },
			{ name: "TEST", firstName: "Another", email: "another@test.test", createdAt: (new Date()).toISOString(), active: false, },
		],
		text: "this is a long test.",
		evaluation: "25.23",
		tags: [ {name: "test"}, {name: "foo"} ],
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
			{ name: "DOE", firstName: "John", email: "test@test.test", createdAt: (new Date()).toISOString(), active: true, },
			{ name: "TEST", firstName: "Another", email: "another@test.test", createdAt: (new Date("1997-09-09")).toISOString(), active: false, },
		],
		text: "this is a long test.",
		evaluation: "25.23",
		tags: [ {name: "test"}, {name: "foo"} ],
	});

	article.authors[0].name = "TEST";
	article.authors[1].createdAt.setMonth(9);

	expect(article.save()).toStrictEqual({
		id: 1,
		authors: [
			{ name: "TEST" },
			{ createdAt: (new Date("1997-10-09")).toISOString() }, //{ name: "TEST", firstName: "Another", email: "another@test.test" },
		],
	});
});

it("test author extension", () => {
	const author = new Author();
	author.name = "test name";
	expect(author.extension()).toStrictEqual("test name");
});
