import { useId } from 'react'
import type { BirthField, BirthFormInput } from '../data/types'
import { useI18n } from '../i18n/useI18n'
import { FormField } from './FormField'
import { PlaceSearch } from './PlaceSearch'
import styles from './PlaceField.module.css'

type PlaceKeys = 'place' | 'manualEntry' | 'latitude' | 'longitude' | 'timeZone'

interface PlaceFieldProps {
  form: Pick<BirthFormInput, PlaceKeys>
  update: (patch: Partial<BirthFormInput>) => void
  /** Already-translated error messages. */
  errors: Partial<Record<'place' | 'latitude' | 'longitude' | 'timeZone', string>>
  ids: Record<Extract<BirthField, 'place' | 'latitude' | 'longitude' | 'timeZone'>, string>
  timeZones: string[]
}

/**
 * Birthplace input: search by name (Open-Meteo), or type coordinates and a
 * time zone by hand. Shared by the birth-details and compatibility forms.
 */
export function PlaceField({ form, update, errors, ids, timeZones }: PlaceFieldProps) {
  const { t } = useI18n()
  const listId = useId()
  return (
    <div className={styles.wrap}>
    {!form.manualEntry ? (
      <FormField id={ids.place} label={t('form.placeLabel')} hint={t('form.placeHint')} error={errors.place}>
        {(control) => (
          <PlaceSearch control={control} value={form.place} onChange={(place) => update({ place })} />
        )}
      </FormField>
    ) : (
      <div className={styles.manual}>
        <div className={styles.row}>
          <FormField id={ids.latitude} label={t('form.latLabel')} hint={t('form.latHint')} error={errors.latitude}>
            {(control) => (
              <input
                {...control}
                className="input"
                inputMode="decimal"
                value={form.latitude}
                onChange={(e) => update({ latitude: e.target.value })}
              />
            )}
          </FormField>
          <FormField id={ids.longitude} label={t('form.lonLabel')} hint={t('form.lonHint')} error={errors.longitude}>
            {(control) => (
              <input
                {...control}
                className="input"
                inputMode="decimal"
                value={form.longitude}
                onChange={(e) => update({ longitude: e.target.value })}
              />
            )}
          </FormField>
        </div>
        <FormField id={ids.timeZone} label={t('form.tzLabel')} hint={t('form.tzHint')} error={errors.timeZone}>
          {(control) => (
            <>
              <input
                {...control}
                className="input"
                list={listId}
                autoComplete="off"
                spellCheck={false}
                value={form.timeZone}
                onChange={(e) => update({ timeZone: e.target.value })}
              />
              <datalist id={listId}>
                {timeZones.map((zone) => (
                  <option key={zone} value={zone} />
                ))}
              </datalist>
            </>
          )}
        </FormField>
      </div>
    )}
    <button
      type="button"
      className={`btn-text ${styles.switch}`}
      onClick={() => update({ manualEntry: !form.manualEntry })}
    >
      {form.manualEntry ? t('form.manualHide') : t('form.manualToggle')}
    </button>
    </div>
  )
}
