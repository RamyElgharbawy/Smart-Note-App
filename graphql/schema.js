const { buildSchema } = require("graphql");
// Build GraphQL schema
const schema = buildSchema(`
  type User {
    id: ID!
    email: String!
  }
  
  type Note {
    id: ID!
    title: String!
    content: String!
    owner: User!
    createdAt: String!
    updatedAt: String!
  }
  
  type NoteResult {
    notes: [Note!]!
    totalCount: Int!
    hasNextPage: Boolean!
  }
  
  input NoteFilter {
    title: String
    createdAfter: String
    createdBefore: String
  }
  
  input CreateNoteInput {
    title: String!
    content: String!
  }
  
  type Query {
    notes(
      page: Int = 1, 
      limit: Int = 10, 
      filter: NoteFilter
    ): NoteResult!
    note(id: ID!): Note
  }
  
  type Mutation {
    createNote(input: CreateNoteInput!): Note!
    updateNote(id: ID!, input: CreateNoteInput!): Note!
    deleteNote(id: ID!): Boolean!
  }
`);

module.exports = schema;
