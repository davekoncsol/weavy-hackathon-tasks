﻿using System;
using System.Runtime.InteropServices;
using Weavy.Core.Models;

namespace Weavy.Areas.Apps.Models {
    /// <summary>
    /// A task management app.
    /// </summary>
    [Serializable]
    [Guid("F1C835B0-E2A7-4CF3-8900-FE95B6504145")]
    [App(Icon = "checkbox-marked-outline", Name = "Tasks", Description = "A tsk management app.", AllowMultiple = true, Content = new Type[] { typeof(TaskItem) }, AllowContentWithSameName = true)]
    public class Tasks : App {
        /// <summary>
        /// Gets or sets the tasks to display in the task list.
        /// </summary>
        public ContentSearchResult<TaskItem> Items { get; set; }
    }
}
