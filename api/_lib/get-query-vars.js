const queryVariables = (query) => {
  const queryItems = Object.keys(query).map((key) => {
    return `${key}=${query[key]}`
  })

  return `?${queryItems.join(`&`)}`
}

module.exports = queryVariables
