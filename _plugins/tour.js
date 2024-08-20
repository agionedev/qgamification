import crud from 'modules/qcrud/_services/baseService'

class Tour {
  constructor() {
    this.tour = null
  }

  //start the tour
  async start(systemName, params = {}) {
    if (!config('app.disableTours')) {
      //Get data
      let tour = await this.getTourData(systemName)

      //Validate tour
      if (tour && (!tour.completed || params.forceStart) && tour.steps.length) {
        //create the tour
        this.createTour(tour, (params.extraSteps || []))
        //Start the tour
        this.callMethod('start')
      }
    }
  }

  //Get the tour information
  getTourData(systemName, refresh = false) {
    return new Promise(resolve => {
      //Request Params
      const requestParams = {
        refresh: refresh,
        params: {
          include: 'activities', 
          filter: {
            "markAsCompleted": true, 
            "field": 'system_name',
            "status": 1
          }
        }
      }
      //Request
      crud.show('apiRoutes.qgamification.categories', systemName, requestParams).then(response => {
        resolve({
          completed: response.data.userCompleted,
          steps: response.data.activities.map(act => ({
            icon: act.options.icon,
            title: act.title,
            content: act.description,
            element: act.options.tourElement,
            position: act.options.tourElementPosition
          }))
        })
      }).catch(error => {
        resolve(null)
      })
    })
  }

  //Create the tour
  createTour(tour, extraSteps) {
    //Init class tour
    this.tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: {enabled: true},
        scrollTo: {behavior: 'smooth', block: 'center'}
      }
    });
    //Instance the steps
    const tourSteps = [...tour.steps, ...(extraSteps || [])]
    //Set steps
    tourSteps.forEach(({title, icon, content, element, position}, index) => {
      this.callMethod('addStep', {
        //title: `<div class="title-tour text-blue-grey">${title}</div>`,
        text: `<div class="tour-item-content">
                <div class="tour-item-icon text-center q-my-md">
                  <i class="${icon} text-primary"></i>
                </div>
                <div class="tour-item-title text-center text-blue-grey text-h6 q-mb-md">${title}</div>
                <div class="tour-item-text">${content}</div>
              </div>`,
        attachTo: {element: element, on: position},
        buttons: this.getTourActions(index, tourSteps.length),
        canClickTarget: false
      });
    });
  }

  //return the tour Actions by index
  getTourActions(index, stepLength) {
    //Instance the actions
    const actions = {
      finish: {
        action: () => this.callMethod('complete'),
        classes: 'tour-primary',
        text: 'Finalizar'
      },
      next: {
        action: () => this.callMethod('next'),
        classes: 'tour-primary',
        text: 'Siguiente'
      },
      back: {
        action: () => this.callMethod('back'),
        classes: 'tour-secondary',
        text: 'Atrás'
      }
    }
    //Instance the Response
    return ((index + 1) == stepLength) ? [actions.back, actions.finish] :
      (index == 0) ? [actions.next] : [actions.back, actions.next]
  }

  //Call dynamic methods from the tour class
  callMethod(name, params = null) {
    this.tour[name](params)
  }
}

const tour = new Tour();
export default tour;
export {tour};
