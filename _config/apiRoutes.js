const moduleName = 'igamification';
const moduleVersion = 'v1';
const urlBase = `/${moduleName}/${moduleVersion}`


export default {
  urlBase : urlBase,
  version: moduleVersion,
  activities: `${urlBase}/activities`,
  categories: `${urlBase}/categories`,
  types: `${urlBase}/types`,
}
