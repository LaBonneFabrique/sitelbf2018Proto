import gql from 'graphql-tag'

export const GET_LISTE_ILLU_FILTRE_ESPACE = gql`
query listeIllustrationFiltered($espace: EspaceBF!) {
  allActivitesIllustrations(filter: {espace: $espace}) {
    id
    idImage
    format
  }
}
`

export const ADD_LISTE_ILLU = gql`
mutation addIllu($idImage: String! , $format: String!, $espace: EspaceBF!) {
  createActivitesIllustration(idImage: $idImage, format: $format, espace: $espace) {
    id
    idImage
    format
  }
}
`

export const DELETE_ILLU_GRAPHQL = gql`
mutation effaceIllu($id: ID!) {
  deleteActivitesIllustration (id: $id) {
    id
  }
}
`

export const DELETE_ILLU = gql`
query effaceImage($imageId: String!){effaceImage(imageId: $imageId) {
  message
}}
`
