process.env.NODE_PATH = process.env.NODE_PATH 
  ? `${process.env.NODE_PATH}:${process.cwd()}/node_modules`
  : `${process.cwd()}/node_modules`;