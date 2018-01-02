<template>
  <div class='formActivite'>
    <div class='row xs-gutter'>
      <div class='col-sm-5'>
        <q-input v-model='dataEvent.titreActivite' stack-label = 'Titre' placeholder='Une nouvelle activité'/> 
        <div class="row xs-gutter">
          <div class="col-sm-7">
          <q-select
        stack-label='Espace concerné'
        color='light-green-8'
        inverted
        separator
        v-model='dataEvent.section'
        :options='listeSection'
      />
        </div>
        <div class="col-sm-1"></div>
        <q-checkbox v-model='dataEvent.checkInscription' label='sur inscription ?' />
        </div>
        <q-input v-model='dataEvent.lieuActivite' stack-label = 'Lieu' placeholder='La Bonne Fabrique'></q-input>
              <q-input
        type='textarea'
        v-model='dataEvent.description'
        stack-label = 'Description'
        placeholder='Une chouette activité !' :min-rows='12'></q-input>
      </div>
      <div class='col-1'></div>
          <div class='col-sm-6'>
      <choix-dates @listeDates='datesUpdate'></choix-dates>
    </div>
    </div>
      <div class='row xs-gutter'>
        <div class="col-sm-6">
   <q-field
        icon='fa-camera-retro'
        label='Illustration'
       />
    


    <div v-for="illu in listeDesIllu">
      <img height="150" width="150" :src="illu.image" /><br />
      <span class="row justify-end">
        <q-radio
          v-model="dataEvent.illustration"
          :val="illu.id"
          unchecked-icon="fa-square-o"
          checked-icon="fa-check-square-o"
        />
        <q-btn flat color="warning" @click="effaceImageDialogue(illu.id, illu.imageId)">
          <q-icon name="fa-times" />
        </q-btn>
      </span>
    </div>
      <div v-if="loadIllu" class="row items-center justify-center" id='illuProcessing'>
        <q-spinner-gears size="50px" color="primary"></q-spinner-gears>
        <div class="justify-center messageProcess">{{message}}</div>
    </div>
    <vue-dropzone
      ref='illustrationDropzone'
      id='illuDropzone'
      :options='dropzoneOptions'
      @vdropzone-sending='envoieImage'
      @vdropzone-success='envoieSucces'
      @vdropzone-upload-progress='envoieProgres'
      @vdropzone-processing='processFile'
      />
    </div>
    <div class="col-sm-6">
      <q-field
        icon='fa-eur'
        label='Prix'
        />
      <div class="row">
        <div class="col-sm-5"><b>Description</b></div>
        <div class="col-sm-2"><b>Prix</b></div>
        <div class="col-sm-3"><b>QF ?</b></div>
      </div>
      <div v-for="pri in dataEvent.prix" class="row">
        <q-input v-model='pri.description' placeholder='Description' class="col-sm-4" />
          <div class="col-sm-1"></div>
        <q-input v-model='pri.prix' placeholder='0' class="col-sm-1" />
        <div class="col-sm-1"></div>
        <q-checkbox v-model='pri.qf' class="col-sm-1" />
        <q-btn class="col-sm-1" flat><q-icon name="fa-minus" /></q-btn>
      </div>
      <q-btn flat>Ajouter un prix</q-btn>
    </div>
   </div>
  </div>
</template>

<script>
import choixDates from './choixDates'
import { QField, QInput, QSelect, QCheckbox, QSpinnerGears, QRadio, QBtn, QIcon, Toast, Dialog } from 'quasar'
import { LISTE_ESPACEBF } from '../constants/listeEnums'
import { GET_LISTE_ILLU_FILTRE_ESPACE, ADD_LISTE_ILLU, DELETE_ILLU_GRAPHQL, DELETE_ILLU } from '../constants/illustrationsGraphQL'

import cloudinary from 'cloudinary-core'
var cl = new cloudinary.Cloudinary({cloud_name: 'la-bonne-fabrique', secure: true})

import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.css'

export default {
  components: {
    choixDates,
    QField,
    QInput,
    QSelect,
    QCheckbox,
    vueDropzone: vue2Dropzone,
    QSpinnerGears,
    QRadio,
    QBtn,
    QIcon
  },
  data () {
    return {
      dataEvent: {
        titreActivite: '',
        section: 'LaBonneFabrique',
        checkInscription: false,
        lieuActivite: 'La Bonne Fabrique',
        listeDesDates: [],
        description: '',
        creneaux: [{horaire: '14h00-17h00', maxParticipants: 8, nbInscrits: 0}],
        illustration: '',
        prix: [{description: 'Adhérent', prix: '10', qf: true}]
      },
      listeDesIllu: [],
      dropzoneOptions: {
        autoProcessQueue: true,
        uploadMultiple: false,
        acceptedFiles: '.jpg,.png,.jpeg,.gif',
        parallelUploads: 10,
        url: 'https://api.cloudinary.com/v1_1/la-bonne-fabrique/image/upload',
        dictDefaultMessage: '<i class=\'fa fa-plus fa-4x\'></i>',
        previewsContainer: false,
        resizeWidth: 1920,
        resizeHeight: 1920,
        resizeMethod: 'contain',
        resizeQuality: 0.9
      },
      loadIllu: 0,
      message: 'rien',
      selectionIllu: '',
      efface: false,
      listeSection: []
    }
  },
  apollo: {
    allEnums: {
      query: LISTE_ESPACEBF,
      update (data) {
        let listeEnum = data.__type.enumValues
        this.listeSection = []
        listeEnum.forEach((valeurEnum) => {
          this.listeSection.push({label: valeurEnum.name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/(L)(e)/g, '$1\'$2'), value: valeurEnum.name})
        })
      }
    },
    allActivitesIllustrations: {
      query: GET_LISTE_ILLU_FILTRE_ESPACE,
      variables () {
        return {
          espace: this.dataEvent.section
        }
      },
      // loadingKey: 'loadIllu',
      watchLoading (isLoading, countModifier) {
        this.loadIllu = isLoading
      },
      update (data) {
        this.listeDesIllu = []
        data.allActivitesIllustrations.forEach((image) => {
          this.listeDesIllu.push({id: image.id, imageId: image.idImage, image: cl.url(image.idImage + '.' + image.format, { width: 150, height: 150, crop: 'fill', gravity: 'auto' }), checked: false, efface: false})
        })
      }
    }
  },
  methods: {
    envoieImage: (file, xhr, formData) => {
      console.log('envoie')
      formData.append('file', file)
      formData.append('upload_preset', 'howigptf') // Replace the preset name with your own
      formData.append('api_key', '355229151489945') // Replace API key with your own Cloudinary key
      formData.append('timestamp', (Date.now() / 1000) | 0)
    },
    envoieSucces (file, response) {
      this.message = 'Succès !'
      console.log('succès')
      this.$apollo.mutate({
        mutation: ADD_LISTE_ILLU,
        variables: {
          idImage: response.public_id,
          format: response.format,
          espace: this.dataEvent.section
        },
        updateQueries: {
        }
      }).then((data) => {
        console.log('ok')
        this.$apollo.queries.allActivitesIllustrations.refetch()
        this.loadIllu = false
      }).catch((error) => {
        // Error
        console.error(error)
      })
    },
    envoieProgres (file, progress, bytesSent) {
      this.message = 'Téléversement ' + progress.toFixed(2) + ' %'
    },
    processFile (file) {
      this.loadIllu = true
      this.message = 'Réduction à une taille raisonnable si besoin...'
      console.log(file)
    },
    effaceImage (id, imageId) {
      this.$apollo.query({
        query: DELETE_ILLU,
        variables: {
          imageId
        }
      }).then((data) => {
        this.$apollo.mutate({
          mutation: DELETE_ILLU_GRAPHQL,
          variables: {
            id
          }
        }).then((data) => {
          this.$apollo.queries.allActivitesIllustrations.refetch()
          Toast.create.positive({
            html: 'L\'image a été effacée avec succès'
          })
        }).catch((error) => {
          console.log(error)
        })
      })
    },
    effaceImageDialogue (id, imageId) {
      Dialog.create({
        title: 'Confirmer',
        message: 'Effacer cette image ?',
        buttons: [
          'Annuler',
          {
            label: 'Effacer',
            handler: () => {
              this.effaceImage(id, imageId)
            }
          }
        ]
      })
    },
    datesUpdate (dates) {
      this.dataEvent.listeDesDates = dates
    }
  }
}
</script>

<style>
  #illuDropzone {
      border-radius: 10%;
      border-style: dashed;
      width: 150px;
      height: 150px;
      margin-left: 10px;
      margin-top: 5px;
    }
  
  #illuProcessing {
      width: 150px;
      height: 150px;
      margin-left: 10px;
      margin-top: 5px;
  }
  
  .messageProcess {
    font-size: x-small;
  }
</style>
