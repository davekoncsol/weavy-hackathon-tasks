using System.Collections.Generic;
using System.Web.Mvc;
using Weavy.Core.Models;
using Weavy.Core.Services;
using Weavy.Areas.Apps.Models;
using Weavy.Web.Controllers;
using System.Threading.Tasks;

namespace Weavy.Areas.Apps.Controllers {
    /// <summary>
    /// Controller for the <see cref="TasksApp"/>.
    /// </summary>    
    [RoutePrefix("{id:int}/F1C835B0-E2A7-4CF3-8900-FE95B6504145")]
    public class TasksController : AppController<Tasks> {

        /// <summary>
        /// Get action for the app
        /// </summary>
        /// <param name="app">The app to display.</param>
        /// <param name="query">An object with query parameters for search, paging etc.</param>        
        public override ActionResult Get(Tasks app, Query query) {
            app.Items = ContentService.Search<TaskItem>(new ContentQuery<TaskItem>(query) { AppId = app.Id, Depth = 1, OrderBy = "SortOrder", Count = true });
            return View(app);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id">The id of the app</param>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("tasks")]
        public async Task<JsonResult> InsertTask(int id, TaskIn model) {
            var app = GetApp(id);
            var task = ContentService.Insert<TaskItem>(new TaskItem { Name = model.Name }, app);

            // push realtime event           
            await PushService.Push("task_inserted", task);
            
            // return json
            return Json(task);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id">Id of the tasks app</param>
        /// <param name="ids">Ids of the tasks so sort</param>
        /// <returns></returns>
        [HttpPost]
        [Route("tasks/sort")]
        public ActionResult UpdateSortOrder(int id, IEnumerable<int> ids) {
            //var app = GetApp(id);

            int order = 0;
            foreach (var i in ids) {
                var task = ContentService.Get<TaskItem>(i);
                if (task != null) {
                    task.SortOrder = order++;
                    ContentService.Update(task);
                }

            }

            return new HttpStatusCodeResult(System.Net.HttpStatusCode.OK);
        }

    }
}
