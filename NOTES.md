## TODO

- [v] Favicon
- [ ] JSON-LD
- [ ] LLM.txt
- [ ] ROBOT.txt

------------------------------

## Next Time You're Here

- the current code optimises for mental overhead.
- it is already the best code without adding abstractions
- only refactor after you've implemented a feature

------------------------------

## Script Explanations

- `dev` 
    - Runs the website in :3000 dev mode
    
- `build`
    - Deletes .next folder
    - Build the website (using "standalone" output)
      This will create a folder in `./.next/standalone` for ready-to-deploy production code

    - Copy static files from .next/static to the standalone folder.
      This is done because standalone folder doesn't include static files.

    - Copy the standalone folder back to ./bin
      This is done because (afaik) npx/pnpx only read the bin files.

- `test`
    - Build the project (npm run build)
    - Transpile the check-site-meta.ts into .js
    - Run the .js file
    - use :skipbuild to skip build process

- Before publishing (prepublishOnly), it will:
    - Build the project
    - Transpile the index.ts

## Difference in Development modes

1.  `pnpm dev` - to only try the website
2.  `pnpm test` - to try the finished build + script
3.  `pnpx check-site-meta` - to try the published build



------------------------------

## Extra Resources

### How to Make the NPX Runnable

1.  In package.json, add `"bin": { "<command-name>": "<location>" }`
    
    In this case, `"check-site-meta": "./bin/check-site-meta.js"`

2.  Add the shebang `#!/usr/bin/env node` 

