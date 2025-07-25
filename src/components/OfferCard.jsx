import React from 'react';
import { Gift, Clock, Tag, ExternalLink } from 'lucide-react';

const OfferCard = ({ offer }) => {
  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpired = () => {
    if (!offer.expiresAt) return false;
    const expireDate = offer.expiresAt.toDate ? offer.expiresAt.toDate() : new Date(offer.expiresAt);
    return new Date() > expireDate;
  };

  const getDaysLeft = () => {
    if (!offer.expiresAt) return null;
    const expireDate = offer.expiresAt.toDate ? offer.expiresAt.toDate() : new Date(offer.expiresAt);
    const today = new Date();
    const diffTime = expireDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = getDaysLeft();
  const expired = isExpired();

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${expired ? 'border-gray-200 opacity-75' : 'border-purple-200'}`}>
      {/* Header with gradient */}
      <div className={`${expired ? 'bg-gray-400' : 'bg-gradient-to-r from-purple-500 to-pink-500'} px-6 py-4`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{offer.title}</h3>
              {offer.discount && (
                <p className="text-sm opacity-90">
                  {offer.discountType === 'percentage' ? `${offer.discount}% OFF` : `$${offer.discount} de descuento`}
                </p>
              )}
            </div>
          </div>
          {!expired && offer.featured && (
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <span className="text-xs font-medium">DESTACADA</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 mb-4 line-clamp-3">
          {offer.description}
        </p>

        {/* Offer details */}
        <div className="space-y-3 mb-4">
          {offer.code && (
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Código:</span>
              </div>
              <span className="font-bold text-purple-600 text-lg">{offer.code}</span>
            </div>
          )}

          {offer.minPurchase && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Compra mínima:</span> ${offer.minPurchase}
            </div>
          )}

          {offer.maxUses && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Usos disponibles:</span> {offer.maxUses - (offer.usedCount || 0)}
            </div>
          )}
        </div>

        {/* Expiration info */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>
                {expired ? 'Expiró el' : 'Válida hasta'} {formatDate(offer.expiresAt)}
              </span>
            </div>
            
            {!expired && daysLeft !== null && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                daysLeft <= 3 
                  ? 'bg-red-100 text-red-600' 
                  : daysLeft <= 7 
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-green-100 text-green-600'
              }`}>
                {daysLeft === 0 ? 'Último día' : `${daysLeft} días restantes`}
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        {!expired && offer.actionUrl && (
          <div className="mt-4">
            <a
              href={offer.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver oferta completa</span>
            </a>
          </div>
        )}

        {expired && (
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500 font-medium">Esta oferta ha expirado</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferCard;
