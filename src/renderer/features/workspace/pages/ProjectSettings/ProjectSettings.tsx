import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { selectWorkspaceState, setNewProject, setScanPath } from '@store/workspace-store/workspaceSlice';
import { SettingsFileInfo, INewProject } from '@api/types';
import { userSettingService } from '@api/services/userSetting.service';
import { workspaceService } from '@api/services/workspace.service';
import { ResponseStatus } from '@api/Response';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import AppConfig from '@config/AppConfigModule';
import { Scanner } from '../../../../../main/task/scanner/types';
import ProjectInfoFields from './sections/ProjectInfoFields';
import ApiConnectionFields from './sections/ApiConnectionFields';
import ScannerOptions from './sections/ScannerOptions';
import PipelineStagesField from './sections/PipelineStagesField';
import ContextFilesInfoAlert from './sections/ContextFilesInfoAlert';

import ScannerSource = Scanner.ScannerSource;
import PipelineStage = Scanner.PipelineStage;

const ProjectSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { projects, scanPath, settings } = useSelector(selectWorkspaceState);
  const showConfigurationOptions = scanPath?.source === ScannerSource.CODE || scanPath?.source === ScannerSource.WFP;

  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const [licenses, setLicenses] = useState([]);
  const [apis, setApis] = useState([]);
  const [settingsFileInfo, setSettingsFileInfo] = useState<SettingsFileInfo>({ type: 'none', fileName: null, legacyType: null });
  const [hasApiKey, setHasApiKey] = useState(false);
  const [projectSettings, setProjectSettings] = useState<INewProject>({
    name: '',
    scan_root: '',
    default_license: '',
    api_key: null,
    api: null,
    token: null,
    source: null,
    sourceCodePath: '',
    scannerConfig: {
      mode: Scanner.ScannerMode.SCAN,
      source: scanPath?.source || ScannerSource.CODE,
      pipelineStages: [
        ...(scanPath?.source !== ScannerSource.IMPORTED_RESULTS_RAW ? [PipelineStage.CODE] : []),
        PipelineStage.DEPENDENCIES,
        PipelineStage.VULNERABILITIES,
        ...(scanPath?.source === ScannerSource.CODE ? [PipelineStage.SEARCH_INDEX] : []),
      ],
      obfuscate: false,
      allExtensions: false,
      recursiveDecompress: false,
      maxDecompressDepth: 3,
    },
  });

  const [projectValidName, setProjectValidName] = useState(false);
  const [projectNameExists, setProjectNameExists] = useState(false);
  const [projectNameReserved, setProjectNameReserved] = useState(false);
  const [showPipelineMinWarning, setShowPipelineMinWarning] = useState(false);

  // Vulnerability scanning needs detected components, which come from either
  // CODE (file/snippet) or DEPENDENCIES detection. Blocks the Continue
  // button when VULNERABILITIES is selected without a data-producing prerequisite.
  const { pipelineStages } = projectSettings.scannerConfig;
  const vulnerabilityRequiresPrereq = pipelineStages.includes(PipelineStage.VULNERABILITIES)
    && !pipelineStages.includes(PipelineStage.CODE)
    && !pipelineStages.includes(PipelineStage.DEPENDENCIES);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return undefined;
    const update = () => {
      const max = el.scrollHeight - el.clientHeight;
      setCanScrollUp(el.scrollTop > 2);
      setCanScrollDown(el.scrollTop < max - 2);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);

  const scrollBodyDown = () => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollBy({ top: el.clientHeight * 0.85, behavior: 'smooth' });
  };

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { path } = scanPath;

    const data = await workspaceService.getLicenses();
    setLicenses(data);

    const apiUrlKey = await userSettingService.get();
    setApis(apiUrlKey.APIS);

    await getSettingsFileInfo();

    let projectName: string = path.split(window.path.sep)[path.split(window.path.sep).length - 1];

    if (projectName.endsWith('.wfp')) { projectName = projectName.replace('.wfp', ''); }

    const defaultApiKey = !!apiUrlKey.APIS?.[apiUrlKey.DEFAULT_API_INDEX]?.API_KEY;
    setHasApiKey(defaultApiKey);
    const defaultTypes = [
      ...(scanPath?.source !== ScannerSource.IMPORTED_RESULTS_RAW ? [PipelineStage.CODE] : []),
      PipelineStage.DEPENDENCIES,
      PipelineStage.VULNERABILITIES,
      ...(scanPath?.source === ScannerSource.CODE ? [PipelineStage.SEARCH_INDEX] : []),
      ...(defaultApiKey ? [PipelineStage.CRYPTOGRAPHY] : []),
    ];

    setProjectSettings({
      ...projectSettings,
      scan_root: path,
      sourceCodePath: scanPath?.source === ScannerSource.CODE ? path : scanPath.sourceCodePath,
      name: projectName,
      scannerConfig: {
        ...projectSettings.scannerConfig,
        pipelineStages: defaultTypes,
      },
    });
  };

  useEffect(() => {
    setApis(settings.APIS);
  }, [settings]);

  const getSettingsFileInfo = async () => {
    const { path } = scanPath;
    setSettingsFileInfo(await workspaceService.getSettingsFileInfo(path));
  };

  const onOpenWorkRoot = () => {
    window.shell.openPath(scanPath.path);
  };

  const onOpenFile = (filepath: string) => {
    const absolutePath = window.path.resolve(scanPath.path, filepath);
    window.shell.openPath(absolutePath);
  };

  const onReload = () => getSettingsFileInfo();

  useEffect(() => {
    const found = projects.find(
      (project) => project.name.trim().toLowerCase() === projectSettings.name.trim().toLowerCase(),
    );
    const isReserved = projectSettings.name.trim().toLowerCase() === AppConfig.SCANOSS_SCAN_SOURCES_FOLDER_NAME;
    // eslint-disable-next-line no-control-regex
    const re = /^[^\s^\x00-\x1f\\?*:"";<>|/.][^\x00-\x1f\\?*:"";<>|/]*[^\s^\x00-\x1f\\?*:"";<>|/.]+$/;

    setProjectNameExists(!!found);
    setProjectNameReserved(isReserved);
    setProjectValidName(projectSettings.name.trim() !== '' && re.test(projectSettings.name));
  }, [projectSettings.name, projects]);

  const submit = async () => {
    dispatch(setScanPath({ ...scanPath, projectName: projectSettings.name }));
    dispatch(setNewProject(projectSettings));
    navigate('/workspace/new/scan');
  };

  const handleClose = (e) => {
    e.preventDefault();
    submit();
  };

  const openLicenseDialog = async () => {
    const response = await dialogCtrl.openLicenseCreate(false);
    if (response && response.action === ResponseStatus.OK) {
      setLicenses([
        ...licenses,
        { spdxid: response.data.spdxid, name: response.data.name },
      ]);
      setProjectSettings({
        ...projectSettings,
        default_license: response.data.spdxid,
      });
    }
  };

  const patchScannerConfig = (patch: Partial<Scanner.ScannerConfig>) => {
    setProjectSettings({
      ...projectSettings,
      scannerConfig: { ...projectSettings.scannerConfig, ...patch },
    });
  };

  const onDecompressToggle = (checked: boolean) => {
    const next: PipelineStage[] = pipelineStages.filter((s) => s !== PipelineStage.UNZIP);
    if (checked) next.push(PipelineStage.UNZIP);
    patchScannerConfig({
      pipelineStages: next,
      recursiveDecompress: checked ? projectSettings.scannerConfig.recursiveDecompress : false,
    });
  };

  const onMaxDecompressDepthChange = (value: string) => {
    const parsed = parseInt(value, 10);
    const next = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 20) : 1;
    patchScannerConfig({ maxDecompressDepth: next });
  };

  const onApiSelectionChange = (selected: { URL: string; API_KEY: string } | null) => {
    const selectedApiKey = selected === null
      ? !!apis?.[settings.DEFAULT_API_INDEX]?.API_KEY
      : !!selected.API_KEY;
    setHasApiKey(selectedApiKey);

    const updatedStages: PipelineStage[] = pipelineStages.filter((s) => s !== PipelineStage.CRYPTOGRAPHY);
    if (selectedApiKey) updatedStages.push(PipelineStage.CRYPTOGRAPHY);

    setProjectSettings({
      ...projectSettings,
      api: selected?.URL,
      api_key: selected?.API_KEY,
      scannerConfig: {
        ...projectSettings.scannerConfig,
        pipelineStages: updatedStages,
      },
    });
  };

  const onPipelineStageToggle = (type: PipelineStage, checked: boolean) => {
    const next = pipelineStages.filter((s) => s !== type);
    if (checked) next.push(type);

    if (scanPath?.source === ScannerSource.CODE && next.length === 0) {
      setShowPipelineMinWarning(true);
      return;
    }
    setShowPipelineMinWarning(false);

    const patch: Partial<Scanner.ScannerConfig> = { pipelineStages: next };
    // When CODE is turned off, the CODE-gated options must be reset too.
    if (type === PipelineStage.CODE && !checked) {
      patch.obfuscate = false;
      patch.hpsm = false;
      patch.allExtensions = false;
    }
    patchScannerConfig(patch);
  };

  return (
    <section id="ProjectSettings" className="app-page">
      <header className="app-header">
        <div>
          <h4 className="header-subtitle back">
            <IconButton tabIndex={-1} onClick={() => navigate(-1)} component="span">
              <ArrowBackIcon />
            </IconButton>
            <span className="text-uppercase">{t('Title:ProjectSettings')}</span>
          </h4>
          <h1 className="mt-0 mb-0">{scanPath.path}</h1>
        </div>
      </header>
      <div className="app-content">
        <form onSubmit={handleClose}>
          <div
            className="ps-body-wrap"
            data-can-up={canScrollUp ? '1' : '0'}
            data-can-down={canScrollDown ? '1' : '0'}
          >
            <div className="scroll-fade top" aria-hidden="true" />
            <div className="scroll-fade bot" aria-hidden="true" />
            <button
              type="button"
              className="scroll-pill"
              onClick={scrollBodyDown}
              aria-label={t('Common:MoreOptions') || 'More options'}
            >
              <KeyboardArrowDownIcon fontSize="inherit" />
              <span>{t('Common:MoreOptions') || 'More options'}</span>
            </button>
            <div className="ps-body" ref={bodyRef}>
              <div className="grid-layout form-container mt-1">
                <div className="settings-left-column">
                  <ProjectInfoFields
                    settings={projectSettings}
                    licenses={licenses}
                    nameIsValid={projectValidName}
                    nameExists={projectNameExists}
                    nameReserved={projectNameReserved}
                    onNameChange={(name) => setProjectSettings({ ...projectSettings, name })}
                    onLicenseChange={(spdxid) => setProjectSettings({ ...projectSettings, default_license: spdxid })}
                    onOpenLicenseDialog={openLicenseDialog}
                  />
                  <ApiConnectionFields
                    apis={apis}
                    showConfigurationOptions={showConfigurationOptions}
                    onApiSelectionChange={onApiSelectionChange}
                    onTokenChange={(token) => setProjectSettings({ ...projectSettings, token })}
                  />
                  {scanPath?.source === ScannerSource.CODE && (
                    <ScannerOptions
                      scannerConfig={projectSettings.scannerConfig}
                      onDecompressToggle={onDecompressToggle}
                      onRecursiveDecompressToggle={(checked) => patchScannerConfig({ recursiveDecompress: checked })}
                      onMaxDecompressDepthChange={onMaxDecompressDepthChange}
                      onObfuscateToggle={(checked) => patchScannerConfig({ obfuscate: checked })}
                      onHpsmToggle={(checked) => patchScannerConfig({ hpsm: checked })}
                      onAllExtensionsToggle={(checked) => patchScannerConfig({ allExtensions: checked })}
                    />
                  )}
                </div>
                <div className="grid-item settings-right-column">
                  <PipelineStagesField
                    pipelineStages={pipelineStages}
                    source={scanPath?.source}
                    hasApiKey={hasApiKey}
                    showPipelineMinWarning={showPipelineMinWarning}
                    vulnerabilityRequiresPrereq={vulnerabilityRequiresPrereq}
                    onToggle={onPipelineStageToggle}
                  />
                  <ContextFilesInfoAlert
                    visible={showConfigurationOptions}
                    info={settingsFileInfo}
                    onReload={onReload}
                    onOpenWorkRoot={onOpenWorkRoot}
                    onOpenFile={onOpenFile}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="button-container">
            <Button
              endIcon={<ArrowForwardIcon />}
              variant="contained"
              color="primary"
              type="submit"
              disabled={!projectValidName || projectNameExists || projectNameReserved || vulnerabilityRequiresPrereq}
            >
              {t('Button:Continue')}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ProjectSettings;
