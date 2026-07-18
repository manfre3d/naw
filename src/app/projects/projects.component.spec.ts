import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsComponent } from './projects.component';
import { ProjectsSection } from '../models/descriptor.model';

const mockSection: ProjectsSection = {
  id: 'projects',
  type: 'PROJECTS',
  style: 'SECTION',
  label: 'Work',
  title: 'Featured Work',
  linkLabel: 'View on GitHub',
  groups: [
    { id: 'work', label: 'Client Work' },
    { id: 'personal', label: 'Side Projects' }
  ],
  elements: [
    { img: 'a.jpg', name: 'Alpha', description: 'First', status: 'Enterprise', category: 'work' },
    { img: 'b.jpg', name: 'Beta', description: 'Second', status: 'Enterprise', category: 'work' },
    { img: 'c.jpg', name: 'Gamma', description: 'Third', category: 'personal', link: 'https://example.com/c', liveUrl: 'https://example.com/c' },
    { img: 'd.jpg', name: 'Delta', description: 'Fourth', category: 'personal', link: 'https://example.com/d' }
  ]
};

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;

  const slideNames = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.project-name')).map((el: any) => el.textContent.trim());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('subDescriptor', mockSection);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a toggle button per group and defaults to the first group', () => {
    const toggles = fixture.nativeElement.querySelectorAll('.group-toggle-btn');
    expect(toggles.length).toBe(2);
    expect(component.activeGroup()).toBe('work');
  });

  it('renders only the active group\'s slides', () => {
    const slides = fixture.nativeElement.querySelectorAll('.project-slide');
    expect(slides.length).toBe(2);
    expect(slideNames()).toEqual(['Alpha', 'Beta']);
  });

  it('switching group filters the slides', () => {
    component.setGroup('personal');
    fixture.detectChanges();
    expect(component.activeGroup()).toBe('personal');
    expect(slideNames()).toEqual(['Gamma', 'Delta']);
  });

  it('starts on the first page with sane defaults', () => {
    expect(component.activePage()).toBe(0);
    expect(component.pages()).toBeGreaterThanOrEqual(1);
    expect(component.pageList().length).toBe(component.pages());
  });

  it('does not scroll before the first page or past the last', () => {
    expect(() => component.prev()).not.toThrow();
    expect(component.activePage()).toBe(0);
    expect(() => component.goTo(999)).not.toThrow();
    expect(component.activePage()).toBeLessThanOrEqual(component.pages() - 1);
  });
});
