const { addToken, update } = require('../helpers')

const {
  TOKEN_CLOSE_TAG,
  TOKEN_CLOSE_TAG_SCRIPT
} = require('../constants/token-types')
const {
  CLOSE_TAG_FACTORY,
  DATA_FACTORY
} = require('../constants/tokenizer-context-factories')

/**
 * @param withinContent — type of content withing
 * which the close tag was found
 */
function getCloseTokenType (withinContent) {
  switch (withinContent) {
    case 'script': {
      return TOKEN_CLOSE_TAG_SCRIPT
    }
    case 'data': {
      return TOKEN_CLOSE_TAG
    }
  }
}

const syntaxHandlers = {
  closingCornerBrace (state, tokens, contextFactories, options) {
    let updatedState = state
    let updatedTokens = tokens
    const tokenType = getCloseTokenType(options.withinContent)
    const dataContext = contextFactories[DATA_FACTORY](
      contextFactories,
      options
    )

    updatedTokens = addToken(tokens, {
      type: tokenType,
      content: `${ state.accumulatedContent }${ state.decisionBuffer }`
    })

    updatedState = update(state, {
      accumulatedContent: '',
      decisionBuffer: '',
      currentContext: dataContext
    })

    return { updatedState, updatedTokens }
  }
}

function parseSyntax (chars, syntaxHandlers, contextFactories, options) {
  if (chars === '>') {
    return (state, tokens) => {
      return syntaxHandlers.closingCornerBrace(
        state,
        tokens,
        contextFactories,
        options
      )
    }
  }
}

module.exports = function closeTagContextFactory (contextFactories, options) {
  return {
    factoryName: CLOSE_TAG_FACTORY,
    parseSyntax: (chars) => parseSyntax(
      chars,
      syntaxHandlers,
      contextFactories,
      options
    )
  }
}