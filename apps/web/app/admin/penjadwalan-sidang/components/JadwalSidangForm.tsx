// apps/web/app/admin/penjadwalan-sidang/components/JadwalSidangForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/apps/web/lib/api';
import { Dosen, Ruangan, Sidang, ConflictCheckResult as ConflictCheckResultType } from '../types';
import ConflictCheckResult from './ConflictCheckResult';
import { useDebounce } from 'use-debounce';

const schema = z.object({
  sidang_id: z.coerce.number().min(1, 'Sidang harus dipilih'),
  tanggal: z.string().min(1, 'Tanggal harus diisi'),
  waktu_mulai: z.string().min(1, 'Waktu mulai harus diisi'),
  waktu_selesai: z.string().min(1, 'Waktu selesai harus diisi'),
  ruangan_id: z.coerce.number().min(1, 'Ruangan harus dipilih'),
});

export default function JadwalSidangForm() {
    const [conflictResult, setConflictResult] = useState<ConflictCheckResultType | null>(null);
  const { data: sidangList } = useQuery<Sidang[]>({
    queryKey: ['sidangListReady'],
    queryFn: () => api.get('/sidang?status=DISETUJUI').then(res => res.data.data),
  });

  const { data: ruanganList } = useQuery<Ruangan[]>({
    queryKey: ['ruanganList'],
    queryFn: () => api.get('/ruangan').then(res => res.data.data),
  });

  const { data: dosenList } = useQuery<Dosen[]>({
    queryKey: ['dosenList'],
    queryFn: () => api.get('/users?role=dosen').then(res => res.data.data),
  });

  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      sidang_id: 0,
      tanggal: '',
      waktu_mulai: '',
      waktu_selesai: '',
      ruangan_id: 0,
    }
  });

  const watchedFields = watch();
  const [debouncedFields] = useDebounce(watchedFields, 500);

  const conflictCheckMutation = useMutation<ConflictCheckResultType, Error, any>({
    mutationFn: (data) => api.post('/jadwal-sidang/check-conflict', data).then(res => res.data.data),
    onSuccess: (data) => {
        setConflictResult(data);
    }
  });

  useEffect(() => {
    const { tanggal, waktu_mulai, waktu_selesai, ruangan_id } = debouncedFields;
    if (tanggal && waktu_mulai && waktu_selesai && ruangan_id > 0) {
      conflictCheckMutation.mutate({
        tanggal,
        waktu_mulai,
        waktu_selesai,
        ruangan_id,
        // Pass dosen IDs if they are part of the form
      });
    }
  }, [debouncedFields, conflictCheckMutation]);

  const onSubmit = (data: any) => {
    console.log(data);
    // Submit logic here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label>Sidang Mahasiswa</label>
            <Controller
            name="sidang_id"
            control={control}
            render={({ field }) => (
                <select {...field} className="w-full border p-2 rounded">
                <option value={0}>Pilih Sidang</option>
                {sidangList?.map(s => <option key={s.id} value={s.id}>{s.mahasiswa.nama} - {s.judul}</option>)}
                </select>
            )}
            />
            {errors.sidang_id && <p className="text-red-500 text-sm">{errors.sidang_id.message}</p>}
        </div>
        <div>
            <label>Ruangan</label>
            <Controller
            name="ruangan_id"
            control={control}
            render={({ field }) => (
                <select {...field} className="w-full border p-2 rounded">
                <option value={0}>Pilih Ruangan</option>
                {ruanganList?.map(r => <option key={r.id} value={r.id}>{r.nama}</option>)}
                </select>
            )}
            />
            {errors.ruangan_id && <p className="text-red-500 text-sm">{errors.ruangan_id.message}</p>}
        </div>
        <div>
            <label>Tanggal</label>
            <Controller name="tanggal" control={control} render={({ field }) => <input type="date" {...field} className="w-full border p-2 rounded" />} />
            {errors.tanggal && <p className="text-red-500 text-sm">{errors.tanggal.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label>Waktu Mulai</label>
                <Controller name="waktu_mulai" control={control} render={({ field }) => <input type="time" {...field} className="w-full border p-2 rounded" />} />
                {errors.waktu_mulai && <p className="text-red-500 text-sm">{errors.waktu_mulai.message}</p>}
            </div>
            <div>
                <label>Waktu Selesai</label>
                <Controller name="waktu_selesai" control={control} render={({ field }) => <input type="time" {...field} className="w-full border p-2 rounded" />} />
                {errors.waktu_selesai && <p className="text-red-500 text-sm">{errors.waktu_selesai.message}</p>}
            </div>
        </div>
      </div>

      <ConflictCheckResult conflictResult={conflictResult} isLoading={conflictCheckMutation.isPending} />

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded" disabled={conflictResult?.hasConflict}>Simpan Jadwal</button>
    </form>
  )
}
