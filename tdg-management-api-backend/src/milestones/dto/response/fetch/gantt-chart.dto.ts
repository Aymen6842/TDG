import { ApiProperty } from '@nestjs/swagger';

import { GanttEpicDto } from './gantt-epic.dto';
import { GanttMilestoneDto } from './gantt-milestone.dto';
import { GanttSprintDto } from './gantt-sprint.dto';
import { GanttTaskDto } from './gantt-task.dto';

export class GanttChartDto {
  @ApiProperty({
    description: 'Milestones included in the gantt chart',
    type: [GanttMilestoneDto],
  })
  milestones: GanttMilestoneDto[];

  @ApiProperty({
    description: 'Epics included in the gantt chart',
    type: [GanttEpicDto],
  })
  epics: GanttEpicDto[];

  @ApiProperty({
    description: 'Sprints included in the gantt chart',
    type: [GanttSprintDto],
  })
  sprints: GanttSprintDto[];

  @ApiProperty({
    description: 'Tasks included in the gantt chart',
    type: [GanttTaskDto],
  })
  tasks: GanttTaskDto[];
}
