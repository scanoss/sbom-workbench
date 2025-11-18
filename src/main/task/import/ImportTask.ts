import { Project } from 'main/workspace/Project';
import { Scanner } from '../scanner/types';
import { fileService } from '../../services/FileService';
import { fileHelper } from '../../helpers/FileHelper';
import { resultService } from '../../services/ResultService';
import { componentService } from '../../services/ComponentService';
import { ScannerStage, ScanState } from '../../../api/types';
import path from 'path';

/**
 * ImportTask handles the complete post-scan result processing pipeline.
 *
 * This task is responsible for:
 * - Reading and parsing scan results from result.json
 * - Attaching scan results to the project tree structure
 * - Inserting file data into the database
 * - Importing and processing component information
 * - Updating project scan state and metadata
 *
 * The task runs as part of the scanner pipeline and marks the scan as finished
 * once all import operations are completed successfully.
 */
export class ImportTask implements Scanner.IPipelineTask {
  /** The project instance containing scan data to be processed */
  private project: Project;

  /**
   * Creates a new ImportTask instance.
   * @param project - The project to process scan results for
   */
  constructor(project: Project) {
    this.project = project;
  }

  /**
   * Returns the stage properties for this import task.
   * @returns Stage properties including name, label, and criticality
   */
  getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.IMPORT_COMPONENT,
      label: 'Importing components',
      isCritical: true,
    };
  }

  /**
   * Executes the complete import process for scan results.
   *
   * Process flow:
   * 1. Reads scan results from result.json file
   * 2. Parses and attaches results to project tree
   * 3. Inserts file information into database
   * 4. Imports component data from scan results
   * 5. Updates project scan state to finished
   * 6. Saves project metadata and state
   *
   * @returns Promise that resolves to true when import is successful
   * @throws Error if result.json cannot be read or parsed
   */
  public async run(): Promise<boolean> {
    const resultPath = path.join(this.project.getMyPath(), 'result.json');
    await fileService.insert(this.project.getTree().getRootFolder().getFiles());
    const files = await fileHelper.getPathFileId();
    await resultService.insertFromFile(resultPath, files);
    await componentService.importComponents();
    this.project.metadata.setScannerState(ScanState.FINISHED);
    this.project.getTree().updateFlags();
    this.project.metadata.save();
    this.project.save();
    return true;
  }
}

