import React, { useState } from 'react';

import { Autocomplete, Checkbox, Chip, Paper, Tab, Tabs, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { SourceType } from '@api/dto';
import useSearchParams from '@hooks/useSearchParams';
import { useNavigate } from 'react-router-dom';

// icons
import SearchIcon from '@mui/icons-material/Search';
import { CryptoReportData } from '@shared/adapters/types';
import { cryptographyService } from '@api/services/cryptography.service';

interface ICryptographyFilter {
  algorithm?: string[];
}

const SecurityReport = () => {
  const { t } = useTranslation();
  const sourceType = useSearchParams().get('type') || SourceType.identified;

  const [tab, setTab] = useState<string>('local');

  // const { data } = useQuery({
  //   queryKey: ['security-report', sourceType],
  //   queryFn: () => cryptographyService.getAll({ type: sourceType as SourceType }),
  // });

  return (
    <section id="SecurityReportPage" className="app-page">
      <header className="app-header">
        <h1 className="header-title">
          {sourceType === SourceType.detected ? t('Title:DetectedSecurity') : t('Title:IdentifiedSecurity')}
        </h1>
        <section className="subheader">
          <nav className="tabs-navigator">
            <Tabs value={tab} onChange={(e, value) => setTab(value)}>
              <Tab value="local" label={`${t('Title:Local')} (${filteredItems?.files.length})`} />
              <Tab value="component" label={`${t('Title:Components')} (${filteredItems?.components.length})`} />
            </Tabs>
          </nav>
        </section>
      </header>

      <main className="app-content">
        {/* {tab === 'local' && (
          <TableContainer className="local-cryptography-table selectable" component={Paper}>
            <Table stickyHeader aria-label="cryptography table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('Table:Header:File')}</TableCell>
                  <TableCell>{t('Table:Header:Algorithms')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems?.files.map((item) => (
                  <TableRow key={item.file}>
                    <TableCell>
                      <Link href="#" underline="hover" color="inherit" onClick={(e) => onSelectFile(e, item.file)}>
                        {item.file}
                      </Link>
                    </TableCell>
                    <TableCell className="algorithms">
                      {item.algorithms.map((algorithm) => (
                        <span className="tag">
                          {' '}
                          {algorithm.algorithm} ({algorithm.strength})
                        </span>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}

                {(!filteredItems || filteredItems.files.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} align="center" className="pt-4 pb-4">
                      {!filteredItems ? t('Loading') : t('NoDataFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 'component' && (
          <TableContainer className="component-cryptography-table selectable" component={Paper}>
            <Table stickyHeader aria-label="cryptography table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('Table:Header:Component')}</TableCell>
                  <TableCell>{t('Table:Header:Algorithms')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems?.components.map((item) => (
                  <TableRow key={item.purl}>
                    <TableCell>{item.purl}</TableCell>
                    <TableCell className="algorithms">
                      {item.algorithms.map((algorithm) => (
                        <span className="tag">
                          {' '}
                          {algorithm.algorithm} ({algorithm.strength})
                        </span>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}

                {(!filteredItems || filteredItems.components.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} align="center" className="pt-4 pb-4">
                      {!filteredItems ? t('Loading') : t('NoDataFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )} */}
      </main>
    </section>
  );
};

export default SecurityReport;
