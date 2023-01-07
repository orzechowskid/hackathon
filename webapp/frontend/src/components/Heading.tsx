import { createContext, useContext, type ParentComponent } from 'react';

const DocumentLevelContext = createContext<{ level: number; }>({
  level: 1
});

const useDocumentLevel = () => useContext<{ level: number}>(DocumentLevelContext);

const getTagNameForLevel = (level: number) => {
  switch (level) {
    case 1: {
      return `h1`;
    }
    case 2: {
      return `h2`;
    }
    case 3: {
      return `h3`;
    }
    case 4: {
      return `h4`;
    }
    case 5: {
      return `h5`;
    }
    case 6: {
      return `h6`;
    }
    default: {
      return `div`;
    }
  }
}

const Heading: ParentComponent = (props) => {
  const {
    level
  } = useDocumentLevel();
  const TagName = getTagNameForLevel(level);

  return <TagName {...props} />;
};

const Section: ParentComponent = (props) => {
  const {
    level
  } = useDocumentLevel();

  return (
    <DocumentLevelContext.Provider value={{ level: level + 1 }}>
      {props.children}
    </DocumentLevelContext.Provider>
  );
};

export {
  Heading,
  Section
};
