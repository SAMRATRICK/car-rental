import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit {
  apiService = inject(ApiService);
  
  @ViewChild('revenueTrendCanvas') revenueTrendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('brandChartCanvas') brandChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueVsBookingsCanvas') revenueVsBookingsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('customerGrowthCanvas') customerGrowthCanvas!: ElementRef<HTMLCanvasElement>;

  dashboardStats = {
    totalCars: 0,
    totalBookings: 0,
    totalCustomers: 0,
    totalRevenue: 0
  };
  
  recentBookings: any[] = [];
  dashboardData: any = null;
  chartsData: any = null;

  private charts: { [key: string]: Chart } = {};

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Charts will be created after data is loaded
  }

  loadDashboardData() {
    this.apiService.getDashboardData().subscribe((res: any) => {
      if (res.result) {
        this.dashboardData = res.data;
        this.dashboardStats = {
          totalCars: res.data.totalCars || 0,
          totalBookings: res.data.totalBookings || 0,
          totalCustomers: res.data.totalCustomers || 0,
          totalRevenue: res.data.totalRevenue || 0
        };

        this.chartsData = res.data.charts;
        
        // Create charts after data is loaded
        setTimeout(() => {
          this.createCharts();
        }, 100);
      }
    });

    this.apiService.getAllBookings().subscribe((res: any) => {
      if (res.result) {
        this.recentBookings = res.data.slice(0, 5);
      }
    });
  }

  createCharts() {
    if (!this.chartsData) return;

    this.createRevenueTrendChart();
    this.createBrandChart();
    this.createRevenueVsBookingsChart();
    this.createCustomerGrowthChart();
  }

  createRevenueTrendChart() {
    if (!this.revenueTrendCanvas || !this.chartsData.revenueTrend) return;

    const ctx = this.revenueTrendCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.chartsData.revenueTrend.map((d: any) => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const data = this.chartsData.revenueTrend.map((d: any) => d.revenue);

    this.charts['revenueTrend'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue (₹)',
          data: data,
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#4F46E5',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 7,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            callbacks: {
              label: (context) => `Revenue: ₹${(context.parsed.y || 0).toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '₹' + value.toLocaleString()
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  createBrandChart() {
    if (!this.brandChartCanvas || !this.chartsData.bookingsByBrand) return;

    const ctx = this.brandChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.chartsData.bookingsByBrand.map((d: any) => d.brand);
    const data = this.chartsData.bookingsByBrand.map((d: any) => d.count);

    const colors = [
      '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
    ];

    this.charts['brand'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              font: { size: 12 },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed} bookings`
            }
          }
        }
      }
    });
  }

  createRevenueVsBookingsChart() {
    if (!this.revenueVsBookingsCanvas || !this.chartsData.revenueVsBookings) return;

    const ctx = this.revenueVsBookingsCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.chartsData.revenueVsBookings.map((d: any) => d.month);
    const revenueData = this.chartsData.revenueVsBookings.map((d: any) => d.revenue);
    const bookingsData = this.chartsData.revenueVsBookings.map((d: any) => d.bookings);

    this.charts['revenueVsBookings'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Revenue (₹)',
            data: revenueData,
            backgroundColor: 'rgba(79, 70, 229, 0.8)',
            borderColor: '#4F46E5',
            borderWidth: 2,
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            label: 'Bookings',
            data: bookingsData,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: '#10B981',
            borderWidth: 2,
            borderRadius: 6,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              padding: 15,
              font: { size: 12 },
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            ticks: {
              callback: (value) => '₹' + value.toLocaleString()
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            grid: {
              drawOnChartArea: false,
            },
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  createCustomerGrowthChart() {
    if (!this.customerGrowthCanvas || !this.chartsData.customerGrowth) return;

    const ctx = this.customerGrowthCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.chartsData.customerGrowth.map((d: any) => d.month);
    const data = this.chartsData.customerGrowth.map((d: any) => d.customers);

    this.charts['customerGrowth'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Customers',
          data: data,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 7,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => `Customers: ${context.parsed.y || 0}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  ngOnDestroy() {
    // Clean up charts
    Object.values(this.charts).forEach(chart => chart.destroy());
  }
}
