
CREATE POLICY "Admins can upload episode videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'episode-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update episode videos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'episode-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete episode videos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'episode-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read episode videos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'episode-videos' AND public.has_role(auth.uid(), 'admin'));
