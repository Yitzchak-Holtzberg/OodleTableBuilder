import { FieldType, MetaData } from '../../../../../projects/angular-utilities/src/public-api';

export interface LanguageVersion {
  id: number;
  version: string;
  releaseYear: number;
  notes: string;
}

export interface LanguageRecord {
  id: number;
  languageName: string;
  appeared: string;
  paradigm: string;
  designer: string;
  typing: string;
  about: string;
  versions: LanguageVersion[];
}

/** Summary view: one row per language. "About" has no width so it fills the row. */
export const languageSummaryMeta: MetaData[] = [
  { key: 'id', displayName: 'No.', fieldType: FieldType.Number, width: '64px' },
  { key: 'languageName', displayName: 'Language', fieldType: FieldType.String, width: '170px' },
  { key: 'appeared', displayName: 'Appeared', fieldType: FieldType.Date, width: '120px', additional: { dateFormat: 'y' } },
  { key: 'paradigm', displayName: 'Paradigm', fieldType: FieldType.String, width: '230px' },
  { key: 'designer', displayName: 'Designer', fieldType: FieldType.String, width: '220px' },
  { key: 'typing', displayName: 'Typing', fieldType: FieldType.String, width: '190px' },
  { key: 'about', displayName: 'About', fieldType: FieldType.String },
];

/** Lines view: one row per notable release. "Notes" has no width. */
export const languageLinesMeta: MetaData[] = [
  { key: 'id', displayName: 'No.', fieldType: FieldType.Number, width: '64px' },
  { key: 'languageName', displayName: 'Language', fieldType: FieldType.String, width: '170px' },
  { key: 'paradigm', displayName: 'Paradigm', fieldType: FieldType.String, width: '230px' },
  { key: 'version', displayName: 'Version', fieldType: FieldType.String, width: '160px' },
  { key: 'releaseYear', displayName: 'Released', fieldType: FieldType.Number, width: '100px' },
  { key: 'notes', displayName: 'Notes', fieldType: FieldType.String },
];

export const languageData: LanguageRecord[] = [
  {
    id: 1, languageName: 'Fortran', appeared: '1957/01/01', paradigm: 'Imperative, procedural',
    designer: 'John Backus (IBM)', typing: 'Static, strong',
    about: 'The first widely used high-level language, built for scientific and numeric computing.',
    versions: [
      { id: 1, version: 'FORTRAN I', releaseYear: 1957, notes: 'The original release for the IBM 704.' },
      { id: 2, version: 'Fortran 90', releaseYear: 1991, notes: 'Added free-form source, modules, and array operations.' },
    ],
  },
  {
    id: 2, languageName: 'Lisp', appeared: '1958/01/01', paradigm: 'Functional, multi-paradigm',
    designer: 'John McCarthy', typing: 'Dynamic, strong',
    about: 'A pioneering language built on symbolic expressions, beloved in AI research.',
    versions: [
      { id: 3, version: 'LISP 1.5', releaseYear: 1962, notes: 'Early influential implementation.' },
      { id: 4, version: 'Common Lisp', releaseYear: 1984, notes: 'Standardized dialect unifying the Lisp family.' },
    ],
  },
  {
    id: 3, languageName: 'COBOL', appeared: '1959/01/01', paradigm: 'Imperative, procedural',
    designer: 'CODASYL committee', typing: 'Static, weak',
    about: 'Designed for business data processing; still runs much of the world\'s finance.',
    versions: [
      { id: 5, version: 'COBOL-60', releaseYear: 1960, notes: 'First standardized version.' },
      { id: 6, version: 'COBOL 2002', releaseYear: 2002, notes: 'Added object-oriented features.' },
    ],
  },
  {
    id: 4, languageName: 'BASIC', appeared: '1964/05/01', paradigm: 'Imperative',
    designer: 'John Kemeny and Thomas Kurtz', typing: 'Dynamic',
    about: 'Created to make programming approachable for students; fueled the home-computer era.',
    versions: [
      { id: 7, version: 'Dartmouth BASIC', releaseYear: 1964, notes: 'The original teaching language.' },
      { id: 8, version: 'Visual Basic', releaseYear: 1991, notes: 'Microsoft\'s event-driven evolution.' },
    ],
  },
  {
    id: 5, languageName: 'Pascal', appeared: '1970/01/01', paradigm: 'Imperative, procedural',
    designer: 'Niklaus Wirth', typing: 'Static, strong',
    about: 'A clean, disciplined teaching language emphasizing structured programming.',
    versions: [
      { id: 9, version: 'Standard Pascal', releaseYear: 1983, notes: 'ISO standardization.' },
      { id: 10, version: 'Object Pascal', releaseYear: 1986, notes: 'Added objects; basis for Delphi.' },
    ],
  },
  {
    id: 6, languageName: 'C', appeared: '1972/01/01', paradigm: 'Imperative, procedural',
    designer: 'Dennis Ritchie (Bell Labs)', typing: 'Static, weak',
    about: 'A small, fast systems language underpinning operating systems and countless tools.',
    versions: [
      { id: 11, version: 'K&R C', releaseYear: 1978, notes: 'Defined by Kernighan and Ritchie\'s book.' },
      { id: 12, version: 'C11', releaseYear: 2011, notes: 'Added threads and improved Unicode support.' },
    ],
  },
  {
    id: 7, languageName: 'Smalltalk', appeared: '1972/01/01', paradigm: 'Object-oriented',
    designer: 'Alan Kay, Dan Ingalls, Adele Goldberg', typing: 'Dynamic, strong',
    about: 'A purely object-oriented system that shaped GUIs and modern OOP thinking.',
    versions: [
      { id: 13, version: 'Smalltalk-80', releaseYear: 1980, notes: 'The widely published, influential release.' },
    ],
  },
  {
    id: 8, languageName: 'SQL', appeared: '1974/01/01', paradigm: 'Declarative, query',
    designer: 'Donald Chamberlin and Raymond Boyce (IBM)', typing: 'Static',
    about: 'The standard declarative language for querying and managing relational databases.',
    versions: [
      { id: 14, version: 'SQL-92', releaseYear: 1992, notes: 'A major, widely implemented standard.' },
      { id: 15, version: 'SQL:2016', releaseYear: 2016, notes: 'Added JSON support and row pattern matching.' },
    ],
  },
  {
    id: 9, languageName: 'C++', appeared: '1985/01/01', paradigm: 'Multi-paradigm (OOP, generic)',
    designer: 'Bjarne Stroustrup (Bell Labs)', typing: 'Static, strong',
    about: 'Extended C with objects, templates, and abstractions for high-performance software.',
    versions: [
      { id: 16, version: 'C++98', releaseYear: 1998, notes: 'First ISO standard.' },
      { id: 17, version: 'C++11', releaseYear: 2011, notes: 'Modernized the language with lambdas, auto, and move semantics.' },
      { id: 18, version: 'C++20', releaseYear: 2020, notes: 'Added concepts, ranges, and coroutines.' },
    ],
  },
  {
    id: 10, languageName: 'Objective-C', appeared: '1984/01/01', paradigm: 'Object-oriented',
    designer: 'Brad Cox and Tom Love', typing: 'Static and dynamic hybrid',
    about: 'A messaging-based OOP layer over C; long the language of Apple platforms.',
    versions: [
      { id: 19, version: 'Objective-C 2.0', releaseYear: 2006, notes: 'Added properties and garbage collection.' },
    ],
  },
  {
    id: 11, languageName: 'Perl', appeared: '1987/12/18', paradigm: 'Multi-paradigm, scripting',
    designer: 'Larry Wall', typing: 'Dynamic',
    about: 'A flexible text-processing powerhouse, once the duct tape of the internet.',
    versions: [
      { id: 20, version: 'Perl 5', releaseYear: 1994, notes: 'The enduring, dominant version.' },
    ],
  },
  {
    id: 12, languageName: 'Erlang', appeared: '1986/01/01', paradigm: 'Functional, concurrent',
    designer: 'Joe Armstrong (Ericsson)', typing: 'Dynamic, strong',
    about: 'Built for massively concurrent, fault-tolerant telecom systems.',
    versions: [
      { id: 21, version: 'Open-source release', releaseYear: 1998, notes: 'Erlang/OTP opened to the world.' },
    ],
  },
  {
    id: 13, languageName: 'Haskell', appeared: '1990/01/01', paradigm: 'Functional (pure, lazy)',
    designer: 'Haskell committee', typing: 'Static, strong (inferred)',
    about: 'A purely functional language with lazy evaluation and a powerful type system.',
    versions: [
      { id: 22, version: 'Haskell 98', releaseYear: 1999, notes: 'Stable standard for teaching and tooling.' },
      { id: 23, version: 'Haskell 2010', releaseYear: 2010, notes: 'Refined standard with FFI.' },
    ],
  },
  {
    id: 14, languageName: 'Python', appeared: '1991/02/20', paradigm: 'Multi-paradigm',
    designer: 'Guido van Rossum', typing: 'Dynamic, strong',
    about: 'A readable, batteries-included language dominant in scripting, data, and AI.',
    versions: [
      { id: 24, version: 'Python 2.0', releaseYear: 2000, notes: 'Introduced list comprehensions and a cycle-detecting GC.' },
      { id: 25, version: 'Python 3.0', releaseYear: 2008, notes: 'A backward-incompatible cleanup of the language.' },
    ],
  },
  {
    id: 15, languageName: 'Lua', appeared: '1993/01/01', paradigm: 'Multi-paradigm, scripting',
    designer: 'Roberto Ierusalimschy et al. (PUC-Rio)', typing: 'Dynamic',
    about: 'A tiny, fast, embeddable language popular for game scripting.',
    versions: [
      { id: 26, version: 'Lua 5.1', releaseYear: 2006, notes: 'Hugely popular embedded version.' },
    ],
  },
  {
    id: 16, languageName: 'R', appeared: '1993/01/01', paradigm: 'Functional, statistical',
    designer: 'Ross Ihaka and Robert Gentleman', typing: 'Dynamic',
    about: 'A language and environment built for statistics, modeling, and data visualization.',
    versions: [
      { id: 27, version: 'R 1.0', releaseYear: 2000, notes: 'First official stable release.' },
    ],
  },
  {
    id: 17, languageName: 'Ruby', appeared: '1995/12/21', paradigm: 'Multi-paradigm (OOP)',
    designer: 'Yukihiro Matsumoto', typing: 'Dynamic, strong',
    about: 'An expressive, programmer-happy language popularized by the Rails framework.',
    versions: [
      { id: 28, version: 'Ruby 1.9', releaseYear: 2007, notes: 'A major performance and Unicode overhaul.' },
      { id: 29, version: 'Ruby 3.0', releaseYear: 2020, notes: 'Targeted big speed gains and better concurrency.' },
    ],
  },
  {
    id: 18, languageName: 'Java', appeared: '1995/05/23', paradigm: 'Object-oriented',
    designer: 'James Gosling (Sun Microsystems)', typing: 'Static, strong',
    about: 'A "write once, run anywhere" language running on the ubiquitous JVM.',
    versions: [
      { id: 30, version: 'Java 8', releaseYear: 2014, notes: 'Added lambdas and the Streams API.' },
      { id: 31, version: 'Java 17', releaseYear: 2021, notes: 'Long-term support release with records and sealed classes.' },
    ],
  },
  {
    id: 19, languageName: 'JavaScript', appeared: '1995/12/04', paradigm: 'Multi-paradigm, scripting',
    designer: 'Brendan Eich (Netscape)', typing: 'Dynamic, weak',
    about: 'The language of the web, now running everywhere from browsers to servers.',
    versions: [
      { id: 32, version: 'ES5', releaseYear: 2009, notes: 'Added strict mode and JSON support.' },
      { id: 33, version: 'ES2015 (ES6)', releaseYear: 2015, notes: 'Classes, modules, arrow functions, and promises.' },
    ],
  },
  {
    id: 20, languageName: 'PHP', appeared: '1995/06/08', paradigm: 'Imperative, OOP, scripting',
    designer: 'Rasmus Lerdorf', typing: 'Dynamic, weak',
    about: 'A server-side scripting language that powers a large share of the web.',
    versions: [
      { id: 34, version: 'PHP 7', releaseYear: 2015, notes: 'Doubled performance over PHP 5.' },
      { id: 35, version: 'PHP 8', releaseYear: 2020, notes: 'Added the JIT compiler and named arguments.' },
    ],
  },
  {
    id: 21, languageName: 'OCaml', appeared: '1996/01/01', paradigm: 'Functional, multi-paradigm',
    designer: 'Xavier Leroy et al. (INRIA)', typing: 'Static, strong (inferred)',
    about: 'A practical functional language with strong typing and fast native code.',
    versions: [
      { id: 36, version: 'OCaml 4.0', releaseYear: 2012, notes: 'Added GADTs and first-class modules improvements.' },
    ],
  },
  {
    id: 22, languageName: 'C#', appeared: '2000/01/01', paradigm: 'Multi-paradigm (OOP)',
    designer: 'Anders Hejlsberg (Microsoft)', typing: 'Static, strong',
    about: 'Microsoft\'s flagship language for the .NET platform and beyond.',
    versions: [
      { id: 37, version: 'C# 6', releaseYear: 2015, notes: 'String interpolation and null-conditional operators.' },
      { id: 38, version: 'C# 9', releaseYear: 2020, notes: 'Records and top-level statements.' },
    ],
  },
  {
    id: 23, languageName: 'Scala', appeared: '2004/01/01', paradigm: 'Multi-paradigm (FP + OOP)',
    designer: 'Martin Odersky', typing: 'Static, strong (inferred)',
    about: 'Fuses functional and object-oriented programming on the JVM.',
    versions: [
      { id: 39, version: 'Scala 3', releaseYear: 2021, notes: 'A major redesign with a new metaprogramming system.' },
    ],
  },
  {
    id: 24, languageName: 'F#', appeared: '2005/01/01', paradigm: 'Functional-first, multi-paradigm',
    designer: 'Don Syme (Microsoft Research)', typing: 'Static, strong (inferred)',
    about: 'A succinct, functional-first .NET language with strong type inference.',
    versions: [
      { id: 40, version: 'F# 1.0', releaseYear: 2005, notes: 'First public release from Microsoft Research.' },
    ],
  },
  {
    id: 25, languageName: 'Clojure', appeared: '2007/01/01', paradigm: 'Functional (Lisp dialect)',
    designer: 'Rich Hickey', typing: 'Dynamic, strong',
    about: 'A modern Lisp for the JVM emphasizing immutability and concurrency.',
    versions: [
      { id: 41, version: 'Clojure 1.0', releaseYear: 2009, notes: 'First stable release.' },
    ],
  },
  {
    id: 26, languageName: 'Go', appeared: '2009/11/10', paradigm: 'Imperative, concurrent',
    designer: 'Griesemer, Pike, and Thompson (Google)', typing: 'Static, strong',
    about: 'A simple, fast language with built-in concurrency for cloud-scale services.',
    versions: [
      { id: 42, version: 'Go 1.0', releaseYear: 2012, notes: 'First stable release with a compatibility promise.' },
      { id: 43, version: 'Go 1.18', releaseYear: 2022, notes: 'Added generics.' },
    ],
  },
  {
    id: 27, languageName: 'Rust', appeared: '2010/07/07', paradigm: 'Multi-paradigm (systems)',
    designer: 'Graydon Hoare (Mozilla)', typing: 'Static, strong (affine)',
    about: 'A systems language guaranteeing memory safety without a garbage collector.',
    versions: [
      { id: 44, version: 'Rust 1.0', releaseYear: 2015, notes: 'First stable release with the ownership model.' },
      { id: 45, version: 'Rust 2021 edition', releaseYear: 2021, notes: 'Refined defaults and closure captures.' },
    ],
  },
  {
    id: 28, languageName: 'Kotlin', appeared: '2011/07/22', paradigm: 'Multi-paradigm (OOP, FP)',
    designer: 'JetBrains', typing: 'Static, strong',
    about: 'A concise, null-safe JVM language and the preferred language for Android.',
    versions: [
      { id: 46, version: 'Kotlin 1.0', releaseYear: 2016, notes: 'First production-ready release.' },
    ],
  },
  {
    id: 29, languageName: 'Dart', appeared: '2011/10/10', paradigm: 'Multi-paradigm (OOP)',
    designer: 'Lars Bak and Kasper Lund (Google)', typing: 'Static, strong',
    about: 'A client-optimized language powering the Flutter UI toolkit.',
    versions: [
      { id: 47, version: 'Dart 2.0', releaseYear: 2018, notes: 'Adopted sound static typing.' },
    ],
  },
  {
    id: 30, languageName: 'Elixir', appeared: '2011/01/01', paradigm: 'Functional, concurrent',
    designer: 'José Valim', typing: 'Dynamic, strong',
    about: 'A productive, fault-tolerant language built on the Erlang virtual machine.',
    versions: [
      { id: 48, version: 'Elixir 1.0', releaseYear: 2014, notes: 'First stable release.' },
    ],
  },
  {
    id: 31, languageName: 'TypeScript', appeared: '2012/10/01', paradigm: 'Multi-paradigm',
    designer: 'Anders Hejlsberg (Microsoft)', typing: 'Static (gradual), strong',
    about: 'A typed superset of JavaScript that scales front-end and back-end codebases.',
    versions: [
      { id: 49, version: 'TypeScript 1.0', releaseYear: 2014, notes: 'First stable release.' },
      { id: 50, version: 'TypeScript 5.0', releaseYear: 2023, notes: 'Decorators and major performance work.' },
    ],
  },
  {
    id: 32, languageName: 'Swift', appeared: '2014/06/02', paradigm: 'Multi-paradigm',
    designer: 'Chris Lattner (Apple)', typing: 'Static, strong',
    about: 'Apple\'s modern, safe language replacing Objective-C across its platforms.',
    versions: [
      { id: 51, version: 'Swift 1.0', releaseYear: 2014, notes: 'Debuted at WWDC.' },
      { id: 52, version: 'Swift 5.0', releaseYear: 2019, notes: 'Achieved a stable ABI.' },
    ],
  },
];

/** Flatten parents into one row per notable release for the lines view. */
export const flattenLanguageVersions = (languages: LanguageRecord[]) =>
  languages.flatMap(l =>
    l.versions.map(v => ({
      ...l,
      ...v,
      id: l.id,
      versionId: v.id,
      parentLanguage: l,
    })),
  );
