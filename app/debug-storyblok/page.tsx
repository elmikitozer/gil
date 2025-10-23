import { getStoryblokApi } from '@storyblok/react/rsc';

export default async function DebugStoryblokPage() {
  let data = null;
  let error = null;

  try {
    const storyblokApi = getStoryblokApi();
    const response = await storyblokApi.get('cdn/stories/home', {
      version: 'draft',
    });
    data = response.data;
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">🔍 Debug Storyblok - GridMasonry</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Erreur:</strong> {error}
        </div>
      )}

      {data && (
        <>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">📋 Structure complète de la story</h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>

          {/* Trouver les GridMasonry */}
          {(() => {
            const findGridMasonry = (obj: any): any[] => {
              const results: any[] = [];

              const search = (item: any) => {
                if (item?.component === 'grid_masonry') {
                  results.push(item);
                }
                if (item?.body && Array.isArray(item.body)) {
                  item.body.forEach(search);
                }
                if (item?.items && Array.isArray(item.items)) {
                  item.items.forEach(search);
                }
              };

              search(obj);
              return results;
            };

            const gridMasonries = findGridMasonry(data);

            return gridMasonries.length > 0 ? (
              <div className="space-y-6">
                {gridMasonries.map((grid, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">🎨 GridMasonry #{idx + 1}</h2>

                    <div className="mb-4">
                      <strong>Nombre d&apos;items:</strong> {grid.items?.length || 0}
                    </div>

                    {grid.items && grid.items.length > 0 ? (
                      <div className="space-y-4">
                        {grid.items.map((item: any, itemIdx: number) => (
                          <div key={itemIdx} className="border border-gray-300 p-4 rounded">
                            <div className="font-semibold mb-2">
                              Item #{itemIdx + 1} - Type: {item.component}
                            </div>

                            {item.component === 'media_item' && (
                              <div className="text-sm space-y-1">
                                <div>
                                  <strong>Media:</strong>{' '}
                                  {item.media?.filename ? (
                                    <span className="text-green-600">✅ {item.media.filename}</span>
                                  ) : (
                                    <span className="text-red-600">❌ Manquant</span>
                                  )}
                                </div>
                                <div>
                                  <strong>Alt:</strong> {item.alt || '(vide)'}
                                </div>
                                <div>
                                  <strong>Title:</strong> {item.title || '(vide)'}
                                </div>
                              </div>
                            )}

                            {item.component === 'video_item' && (
                              <div className="text-sm space-y-1">
                                <div>
                                  <strong>video_source:</strong>{' '}
                                  {item.video_source ? (
                                    <span className="text-blue-600">{item.video_source}</span>
                                  ) : (
                                    <span className="text-orange-500">
                                      ⚠️ Non défini (auto-détection)
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <strong>vimeoId:</strong>{' '}
                                  {item.vimeoId ? (
                                    <span className="text-green-600">✅ {item.vimeoId}</span>
                                  ) : (
                                    <span className="text-gray-500">-</span>
                                  )}
                                </div>
                                <div>
                                  <strong>srcMp4:</strong>{' '}
                                  {item.srcMp4 ? (
                                    <span className="text-green-600">✅ {item.srcMp4}</span>
                                  ) : (
                                    <span className="text-gray-500">-</span>
                                  )}
                                </div>
                                <div>
                                  <strong>srcWebm:</strong>{' '}
                                  {item.srcWebm || <span className="text-gray-500">-</span>}
                                </div>
                                <div>
                                  <strong>poster:</strong>{' '}
                                  {item.poster?.filename || (
                                    <span className="text-gray-500">-</span>
                                  )}
                                </div>
                                <div>
                                  <strong>ratio:</strong> {item.ratio || '(défaut: 16:9)'}
                                </div>
                                <div>
                                  <strong>title:</strong> {item.title || '(vide)'}
                                </div>

                                {/* Diagnostic */}
                                <div className="mt-3 p-3 bg-gray-100 rounded">
                                  <strong>🔍 Diagnostic:</strong>
                                  {!item.vimeoId && !item.srcMp4 ? (
                                    <div className="text-red-600 font-semibold mt-1">
                                      ❌ PROBLÈME: Ni vimeoId ni srcMp4 défini. Cette vidéo ne
                                      s&apos;affichera pas !
                                    </div>
                                  ) : item.vimeoId && item.srcMp4 ? (
                                    <div className="text-orange-500 mt-1">
                                      ⚠️ Les deux sont définis. Vimeo sera utilisé (prioritaire).
                                    </div>
                                  ) : item.vimeoId ? (
                                    <div className="text-green-600 mt-1">
                                      ✅ Vidéo Vimeo OK (ID: {item.vimeoId})
                                    </div>
                                  ) : (
                                    <div className="text-green-600 mt-1">✅ Vidéo MP4 OK</div>
                                  )}
                                </div>
                              </div>
                            )}

                            <details className="mt-3">
                              <summary className="cursor-pointer text-blue-600 hover:underline">
                                Voir JSON complet
                              </summary>
                              <pre className="bg-gray-900 text-green-400 p-2 rounded text-xs mt-2 overflow-auto">
                                {JSON.stringify(item, null, 2)}
                              </pre>
                            </details>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-red-600 font-semibold">
                        ❌ Aucun item trouvé dans ce GridMasonry !
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                ⚠️ Aucun GridMasonry trouvé dans cette story
              </div>
            );
          })()}
        </>
      )}

      <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
        <h3 className="font-semibold mb-2">💡 Comment utiliser cette page :</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Vérifiez que vos GridMasonry apparaissent</li>
          <li>Vérifiez que vos video_item ont soit vimeoId soit srcMp4</li>
          <li>Regardez le diagnostic de chaque vidéo</li>
          <li>Si tout est vert, le problème vient d&apos;ailleurs (CSS, composant, etc.)</li>
        </ol>
      </div>
    </div>
  );
}
