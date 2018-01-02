import gql from 'graphql-tag'

export const LISTE_ESPACEBF = gql`
    query enumValuesOfEspaceBF {
      __type(name: "EspaceBF") {
        name
        enumValues {
          name
        }
      }
    }
`
