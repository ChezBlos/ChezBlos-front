import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  TrendUp,
  TrendDown,
  CurrencyDollar,
  ChartBar,
  ChartPie,
} from "@phosphor-icons/react";
import {
  SalesBarChart,
  TrendLineChart,
  PaymentMethodChart,
  ComparisonChart,
} from "../../../../components/charts";

const CommandesRecettesStatsSection = ({
  advancedStats,
  dashboardStats,
  todayVsYesterday,
  revenueChange,
  monthlyRevenueData,
  weeklyTrendData,
  paymentStats,
  topItems,
  comparisonData,
  formatPrice,
}: any) => {
  return (
    <>
      {/* KPI Cards Performances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Commandes Aujourd'hui
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {(advancedStats?.today?.commandes !== undefined
                    ? advancedStats.today.commandes
                    : dashboardStats?.today?.commandes) || 0}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {todayVsYesterday.isPositive ? (
                    <TrendUp size={16} className="text-green-600" />
                  ) : (
                    <TrendDown size={16} className="text-red-600" />
                  )}
                  <span
                    className={`text-sm ${
                      todayVsYesterday.isPositive
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {todayVsYesterday.value.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-5">vs hier</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ChartBar size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Revenus Aujourd'hui
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(
                    (advancedStats?.today?.recettes !== undefined
                      ? advancedStats.today.recettes
                      : dashboardStats?.today?.recettes) || 0
                  )}{" "}
                  XOF
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {revenueChange.isPositive ? (
                    <TrendUp size={16} className="text-green-600" />
                  ) : (
                    <TrendDown size={16} className="text-red-600" />
                  )}
                  <span
                    className={`text-sm ${
                      revenueChange.isPositive
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {revenueChange.value.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-5">vs hier</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyDollar size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cette Semaine</p>
                <p className="text-xl font-bold text-gray-900">
                  {advancedStats?.week?.commandes !== undefined
                    ? advancedStats.week.commandes
                    : 0}{" "}
                  commandes
                </p>
                <p className="text-sm text-orange-600">
                  {formatPrice(
                    advancedStats?.week?.recettes !== undefined
                      ? advancedStats.week.recettes
                      : 0
                  )}{" "}
                  XOF
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <ChartBar size={20} className="text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ce Mois</p>
                <p className="text-xl font-bold text-gray-900">
                  {advancedStats?.month?.commandes !== undefined
                    ? advancedStats.month.commandes
                    : 0}{" "}
                  commandes
                </p>
                <p className="text-sm text-orange-600">
                  {formatPrice(
                    advancedStats?.month?.recettes !== undefined
                      ? advancedStats.month.recettes
                      : 0
                  )}{" "}
                  XOF
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <ChartPie size={20} className="text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Graphiques de performances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Ventes</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyRevenueData && monthlyRevenueData.length > 0 ? (
              <SalesBarChart data={monthlyRevenueData} height={350} />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-5">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tendance des Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyTrendData && weeklyTrendData.length > 0 ? (
              <TrendLineChart
                data={weeklyTrendData}
                title="Commandes 7 derniers jours"
                color="#f97316"
                height={350}
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-5">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Modes de paiement et Top plats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Modes de Paiement</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentStats && paymentStats.length > 0 ? (
              <PaymentMethodChart data={paymentStats} height={350} />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-5">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Plats Vendus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topItems && topItems.length > 0 ? (
                topItems.map((plat: any, index: number) => (
                  <div
                    key={plat._id}
                    className="flex items-center justify-between p-3 bg-gray-5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-5">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium">{plat.nom}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {plat.quantiteVendue} vendus
                      </span>
                      <span className="text-sm font-semibold">
                        {formatPrice(plat.revenus)} XOF
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-5 py-8">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Comparaison des périodes */}
      {comparisonData && (
        <Card>
          <CardHeader>
            <CardTitle>Comparaison des Périodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComparisonChart data={comparisonData} height={300} />
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    {comparisonData.period1.label}
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-600">Commandes:</span>{" "}
                      <span className="font-medium">
                        {comparisonData.period1.commandes}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Recettes:</span>{" "}
                      <span className="font-medium">
                        {formatPrice(comparisonData.period1.recettes)} XOF
                      </span>
                    </p>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">
                    {comparisonData.period2.label}
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-600">Commandes:</span>{" "}
                      <span className="font-medium">
                        {comparisonData.period2.commandes}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Recettes:</span>{" "}
                      <span className="font-medium">
                        {formatPrice(comparisonData.period2.recettes)} XOF
                      </span>
                    </p>
                  </div>
                </div>
                <div className="bg-gray-5 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Différences
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm flex items-center gap-2">
                      <span className="text-gray-600">Commandes:</span>
                      <span
                        className={`font-medium flex items-center gap-1 ${
                          comparisonData.differences.commandesPercent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {comparisonData.differences.commandesPercent >= 0 ? (
                          <TrendUp size={14} />
                        ) : (
                          <TrendDown size={14} />
                        )}
                        {Math.abs(
                          comparisonData.differences.commandesPercent
                        ).toFixed(1)}
                        %
                      </span>
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <span className="text-gray-600">Recettes:</span>
                      <span
                        className={`font-medium flex items-center gap-1 ${
                          comparisonData.differences.recettesPercent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {comparisonData.differences.recettesPercent >= 0 ? (
                          <TrendUp size={14} />
                        ) : (
                          <TrendDown size={14} />
                        )}
                        {Math.abs(
                          comparisonData.differences.recettesPercent
                        ).toFixed(1)}
                        %
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default CommandesRecettesStatsSection;
